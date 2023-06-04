import { Product } from "./models/product.js";
import { Section } from "./models/section.js";
import { User } from "./models/user.js";
import { Trainee } from "./models/trainee.js";
import { Lecture } from "./models/lecture.js";
import { Course } from "./models/course.js";

import cloudinary from "cloudinary";

function getUnique(value, index, array) {
  return self.indexOf(value) === index;
}

function omit(obj, ...props) {
  const result = { ...obj };
  props.forEach(function (prop) {
    delete result[prop];
  });
  return result;
}

cloudinary.v2.config({
  cloud_name: "dxjhcfinq",
  api_key: "292858742431259",
  api_secret: "os1QzAVfEfifsaRgMvsXEfXlPws",
});

const isFile = (value) => {
  return false;
};

const resolvers = {
  Course: {
    lectures: async (parent, args, context, info) => {
      const lectures = await Lecture.find({
        course: parent?.id,
        removed: false,
      });
      return lectures;
    },
  },
  Trainee: {
    registeredCourses: async (parent, args, context, info) => {
      let courses = [];

      for (let _course of parent?.registeredCourses) {
        let course = {
          id: _course._id,
          course: await Course.findById(_course?.course),
          completed: _course?.completed,
          progress: _course?.progress,
        };
        courses.push(course);
      }

      return courses;
    },
  },
  Query: {
    getSections: async (_, { page }) => {
      const sections = await Section.find({ page });
      return sections;
    },
    getProducts: async (_, args) => {
      const products = await Product.find({ removed: false });
      return products;
    },
    getProduct: async (_, args) => {
      const product = await Product.findById(args.id);
      return product;
    },
    getFeatured: async (_, args) => {
      const products = await Product.find({ featured: true });
      return products;
    },
    getUsers: async (_, args) => {
      const users = await User.find();
      return users;
    },
    getCourses: async (_, args) => {
      const courses = await Course.find().populate("addedBy");
      return courses;
    },
    getTrainee: async (_, { id }) => {
      const trainee = await Trainee.findById(id);
      return trainee;
    },
    getTrainees: async (_, args) => {
      const trainees = await Trainee.find();
      return trainees;
    },
    getUser: async (_, args) => {
      const { email, password, id } = args;

      let user;

      if (!id) {
        user = await User.findOne({ email, password });
      } else if (id) {
        user = await User.findById(id);
      }

      return user;
    },
  },

  Mutation: {
    updateTrainee: async (_, args) => {
      const { id, course, progress, completed } = args;

      await Trainee.updateOne(
        { _id: id },
        omit(args, ["id", "course", "progress", "completed"])
      );

      if (course && progress) {
        await Trainee.updateOne(
          {
            _id: id,
            registeredCourses: { $elemMatch: { course } },
          },
          {
            $set: { "registeredCourses.$.progress": progress },
          }
        );
      }

      if (course && progress && completed) {
        await Trainee.updateOne(
          {
            _id: id,
            registeredCourses: { $elemMatch: { course } },
          },
          {
            $set: {
              "registeredCourses.$.completed": completed,
              "registeredCourses.$.progress": progress,
            },
          }
        );
      }

      let trainee = await Trainee.findById(id);
      return trainee;
    },
    addCourse: async (_, args) => {
      console.log(args);

      const {
        name,
        addedBy,
        price,
        description,
        image,
        category,
        onSale,
        was,
      } = args;

      let res = await cloudinary.v2.uploader.upload(image, {
        public_id: "",
        folder: "courses",
      });

      let newCourse = new Course({
        name,
        addedBy,
        price,
        description,
        category,
        onSale: onSale ? onSale : false,
        was,
        image: res?.url,
      });

      let course = newCourse.save();
      return course;
    },
    updateLecture: async (_, args) => {
      console.log(omit(args, ["id"]));

      await Lecture.updateOne({ _id: args.id }, omit(args, ["id"]));

      let lecture = await Lecture.findById(args.id);
      return lecture;
    },
    enrollCourse: async (_, args) => {
      const { trainee, course } = args;

      await Trainee.updateOne(
        { _id: trainee },
        {
          $addToSet: {
            registeredCourses: { course, completed: false, progress: 0 },
          },
        }
      );

      let _trainee = await Trainee.findById(trainee);
      return _trainee;
    },
    addLecture: async (_, args) => {
      const { description, content, title, quiz, course } = args;

      const newLecture = new Lecture({
        quiz: JSON.parse(quiz),
        description,
        content,
        title,
        course,
        removed: false,
      });

      const lecture = newLecture.save();
      return lecture;
    },
    addTrainee: async (_, args) => {
      const { email, fullName, password } = args;

      let newTrainee = new Trainee({
        email,
        fullName,
        password,
      });

      let trainee = newTrainee.save();
      return trainee;
    },
    addSection: async (_, { page, value, identifier }) => {
      if (isFile(value)) {
        let res = await cloudinary.v2.uploader.upload(value, {
          public_id: "",
          folder: "sections",
        });
        const newSection = new Section({
          page,
          value: res.url,
          identifier,
        });

        const section = newSection.save();
        return section;
      } else {
        const newSection = new Section({
          page,
          value,
          identifier,
        });

        const section = newSection.save();
        return section;
      }
    },
    addUser: async (_, args) => {
      const { firstName, lastName, email, userLevelAccess } = args;

      let newUser;

      switch (userLevelAccess) {
        case "super-admin":
          newUser = new User({
            firstName,
            lastName,
            email,
            password: "serenepsl",
            canModifyUsers: true,
            canModifyContent: true,
            canModifySections: true,
            canModifyProducts: true,
          });
          break;

        case "content-manager":
          newUser = new User({
            firstName,
            lastName,
            email,
            password: "serenepsl",
            canModifyUsers: false,
            canModifyContent: true,
            canModifySections: false,
            canModifyProducts: true,
          });
          break;

        default:
          newUser = new User({
            firstName,
            lastName,
            email,
            password: "serenepsl",
            canModifyUsers: false,
            canModifyContent: false,
            canModifySections: false,
            canModifyProducts: false,
          });
          break;
      }

      let user = newUser.save();
      return user;
    },
    addProduct: async (_, args) => {
      const {
        category,
        subCategory,
        name,
        image,
        specSheet,
        description,
        featured,
      } = args;

      let res1 = await cloudinary.v2.uploader.upload(image, {
        public_id: "",
        folder: "products",
      });

      let res2 = await cloudinary.v2.uploader.upload(specSheet, {
        public_id: "",
        folder: "specSheets",
      });

      console.log(res1.url, res2.url);

      const newProduct = new Product({
        category,
        subCategory,
        name,
        image: res1.url,
        specSheet: res2.url,
        description,
        removed: false,
        featured,
      });

      let product = newProduct.save();
      return product;
    },
    updateSection: async (_, { identifier, value }) => {
      if (isFile(value)) {
        let res = await cloudinary.v2.uploader.upload(value, {
          public_id: "",
          folder: "sections",
        });
        await Section.updateOne({ identifier }, { value: res.url });

        let section = await Section.findOne({ identifier });
        return section;
      } else {
        await Section.updateOne({ identifier }, { value });
        let section = await Section.findOne({ identifier });
        return section;
      }
    },
    updateProduct: async (_, args) => {
      console.log(omit(args, ["id"]));

      await Product.updateOne({ _id: args.id }, omit(args, ["id"]));

      let product = await Product.findById(args.id);
      return product;
    },
    updateUser: async (_, args) => {
      await User.updateOne({ email: args.email }, omit(args, ["email"]));
      let user = await User.findOne({ email: args.email });
      return user;
    },
  },
};

export default resolvers;
