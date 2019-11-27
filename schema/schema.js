// Schema descreve os dados, tipos, relacionamentos...
// 1 - Define tipos
// 2 - Define relacionamentos entre tipos
// 3 - Define rootqueries

// Rootquery = como o usuário entra no grafo e busca algo
const graphql = require("graphql");
const {
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema
} = graphql;
const { Types } = require("mongoose");
const parse = require("date-fns/parse");
const set = require("date-fns/set");
const User = require("../models/user");
const Meal = require("../models/meal");
const Diet = require("../models/diet");
const Measure = require("../models/measure");

const MeasureType = new GraphQLObjectType({
  name: "Measure",
  fields: () => ({
    id: { type: GraphQLID },
    user: { type: UserType },
    weight: { type: GraphQLInt },
    height: { type: GraphQLInt },
    waist: { type: GraphQLInt },
    hip: { type: GraphQLInt },
    createdAt: { type: GraphQLString }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
    email: { type: GraphQLString },
    type: { type: GraphQLString },
    crn: { type: GraphQLString },
    doctor: {
      type: GraphQLID
    },
    diets: {
      type: new GraphQLList(DietType),
      async resolve(parent, args) {
        const res = await Diet.find({ user: parent._id });
        return res;
      }
    },
    measures: {
      type: new GraphQLList(MeasureType),
      async resolve(parent, _) {
        const res = await Measure.find({ user: parent._id }).sort({
          createdAt: -1
        });
        return res;
      }
    }
  })
});

const DietType = new GraphQLObjectType({
  name: "Diet",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    user: { type: GraphQLID },
    meals: {
      type: GraphQLList(MealType),
      async resolve(parent, args) {
        const meal = await Meal.find({ diet: parent.id }).sort({ schedule: 1 });

        return meal;
      }
    }
  })
});

const MealType = new GraphQLObjectType({
  name: "Meal",
  fields: () => ({
    id: { type: GraphQLID },
    schedule: { type: GraphQLString },
    foods: { type: GraphQLList(GraphQLString) },
    name: { type: GraphQLString },
    diet: { type: GraphQLID }
  })
});

// Cada field é uma "entrada"
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType, // O tipo que retorna
      args: { id: { type: GraphQLID }, email: { type: GraphQLString } }, // O que vai usar pra buscar
      async resolve(_, args) {
        const query = {};

        if (args.id) query._id = Types.ObjectId(args.id);

        if (args.email) query.email = args.email;

        const user = await User.findOne(query);
        return user;
      }
    },
    diet: {
      type: DietType,
      args: { id: { type: GraphQLID } },
      resolve(_, args) {
        return Diet.findById(Types.ObjectId(args.id));
      }
    },
    users: {
      type: GraphQLList(UserType),
      args: { doctor: { type: GraphQLID } },
      resolve(_, args) {
        const { doctor } = args;
        const query = {};

        if (doctor) query.doctor = Types.ObjectId(doctor);

        return User.find(query);
      }
    },
    measures: {
      type: GraphQLList(MeasureType),
      args: { user: { type: GraphQLID } },
      resolve(_, args) {
        return Measure.find({ user: Types.ObjectId(args.user) });
      }
    }
  }
});

const Mutations = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(GraphQLString) },
        crn: { type: GraphQLString },
        doctor: { type: GraphQLID }
      },
      resolve(_, args) {
        try {
          let user = new User({
            name: args.name,
            password: args.password,
            email: args.email,
            type: args.type,
            crn: args.crn ? args.crn : null,
            doctor: args.doctor ? Types.ObjectId(args.doctor) : null
          });

          return user.save();
        } catch (err) {
          console.log({ err });
        }
      }
    },

    removeUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve(_, args) {
        return User.findByIdAndDelete(Types.ObjectId(args.id));
      }
    },

    addDiet: {
      type: DietType,
      args: {
        user: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(_, args) {
        let diet = new Diet({
          name: args.name,
          user: Types.ObjectId(args.user)
        });

        return diet.save();
      }
    },

    editDiet: {
      type: DietType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        diet: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(_, args) {
        return Diet.findByIdAndUpdate(Types.ObjectId(args.diet), {
          name: args.name
        });
      }
    },

    removeDiet: {
      type: DietType,
      args: {
        diet: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(_, args) {
        return Diet.findByIdAndDelete(Types.ObjectId(args.diet));
      }
    },

    addMeal: {
      type: MealType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        diet: { type: new GraphQLNonNull(GraphQLID) },
        foods: { type: new GraphQLList(GraphQLString) },
        schedule: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(_, { diet, foods, schedule, name }) {
        schedule = parse(schedule, "HH:mm", new Date());
        schedule = set(schedule, { year: 2019, month: 2, date: 3 });
        let meal = new Meal({
          diet: Types.ObjectId(diet),
          foods,
          schedule,
          name
        });

        return meal.save();
      }
    },

    removeMeal: {
      type: MealType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, { id }) {
        return Meal.remove({ _id: Types.ObjectId(id) });
      }
    },

    addMeasure: {
      type: MeasureType,
      args: {
        user: { type: new GraphQLNonNull(GraphQLID) },
        height: { type: new GraphQLNonNull(GraphQLInt) },
        weight: { type: new GraphQLNonNull(GraphQLInt) },
        waist: { type: new GraphQLNonNull(GraphQLInt) },
        hip: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(_, { user, height, weight, waist }) {
        let measure = new Measure({
          user,
          height,
          weight,
          waist,
          hip
        });

        return measure.save();
      }
    },

    removeMeasure: {
      type: MeasureType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(_, { id }) {
        return Measure.findByIdAndDelete(Types.ObjectId(id));
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations
});
