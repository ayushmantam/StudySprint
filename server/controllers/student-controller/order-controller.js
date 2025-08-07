const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      paymentId,
      payerId,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    // Handle free course (skip PayPal)
    if (Number(coursePricing) === 0) {
      const newlyCreatedCourseOrder = new Order({
        userId,
        userName,
        userEmail,
        orderStatus: "confirmed",
        paymentMethod: "free",
        paymentStatus: "paid",
        orderDate,
        paymentId: null,
        payerId: null,
        instructorId,
        instructorName,
        courseImage,
        courseTitle,
        courseId,
        coursePricing,
      });

      await newlyCreatedCourseOrder.save();

      // Add course to student's courses
      let studentCourses = await StudentCourses.findOne({ userId });
      if (studentCourses) {
        studentCourses.courses.push({
          courseId,
          title: courseTitle,
          instructorId,
          instructorName,
          dateOfPurchase: orderDate,
          courseImage,
        });
        await studentCourses.save();
      } else {
        const newStudentCourses = new StudentCourses({
          userId,
          courses: [{
            courseId,
            title: courseTitle,
            instructorId,
            instructorName,
            dateOfPurchase: orderDate,
            courseImage,
          }],
        });
        await newStudentCourses.save();
      }

      // Add student to course
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: {
          students: {
            studentId: userId,
            studentName: userName,
            studentEmail: userEmail,
            paidAmount: 0,
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          approveUrl: null,
          orderId: newlyCreatedCourseOrder._id,
        },
        message: "Free course enrolled successfully.",
      });
    }

    // Paid course (PayPal flow)
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/payment-return`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courseTitle,
                sku: courseId,
                price: Number(coursePricing).toFixed(2),
                currency: "INR",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "INR",
            total: Number(coursePricing).toFixed(2),
          },
          description: courseTitle,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.error(JSON.stringify(error, null, 2)); // More detailed error logging
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment!",
        });
      } else {
        const newlyCreatedCourseOrder = new Order({
          userId,
          userName,
          userEmail,
          orderStatus,
          paymentMethod,
          paymentStatus,
          orderDate,
          paymentId,
          payerId,
          instructorId,
          instructorName,
          courseImage,
          courseTitle,
          courseId,
          coursePricing,
        });

        await newlyCreatedCourseOrder.save();

        const approveUrl = paymentInfo.links.find(
          (link) => link.rel == "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          data: {
            approveUrl,
            orderId: newlyCreatedCourseOrder._id,
          },
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    await order.save();

    //update out student course model
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: order.orderDate,
        courseImage: order.courseImage,
      });

      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    //update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder };