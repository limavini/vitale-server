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
  GraphQLSchema
} = graphql;
const { Types } = require("mongoose");
const parse = require("date-fns/parse");
const set = require("date-fns/set");
const User = require("../models/user");
const Meal = require("../models/meal");
const Diet = require("../models/diet");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
    email: { type: GraphQLString },
    type: { type: GraphQLString },
    doctor: {
      type: GraphQLID
    },
    diets: {
      type: new GraphQLList(DietType),
      async resolve(parent, args) {
        const res = await Diet.find({ user: parent._id });
        console.log(res);
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
        const meal = await Meal.find({ diet: parent.id }).sort({schedule: 1});

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
      args: { id: { type: GraphQLID } }, // O que vai usar pra buscar
      resolve(parent, args) {
        return User.findById(Types.ObjectId(args.id));
      }
    },
    diet: {
      type: DietType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Diet.findById(Types.ObjectId(args.id));
      }
    },
    users: {
      type: GraphQLList(UserType),
      args: { doctor: { type: GraphQLID } },
      resolve(parent, args) {
        const { doctor } = args;
        const query = {};

        if (doctor) query.doctor = Types.ObjectId(doctor);

        return User.find(query);
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
        doctor: { type: GraphQLID }
      },
      resolve(_, args) {
        let user = new User({
          name: args.name,
          password: args.password,
          email: args.email,
          type: args.type,
          doctor: args.doctor ? Types.ObjectId(args.doctor) : null
        });

        return user.save();
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
        name: { type: new GraphQLNonNull(GraphQLString)},
        diet: { type: new GraphQLNonNull(GraphQLID)}
      },
      resolve(_, args) {
        return Diet.findByIdAndUpdate(Types.ObjectId(args.diet), { name: args.name });
      }
    },

    removeDiet: {
      type: DietType,
      args: {
        diet: { type: new GraphQLNonNull(GraphQLID)},
      },
      resolve(_, args) {
        return Diet.findByIdAndDelete(Types.ObjectId(args.diet));
      }
    },

    addMeal: {
      type: MealType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString)},
        diet: { type: new GraphQLNonNull(GraphQLID) },
        foods: { type: new GraphQLList(GraphQLString) },
        schedule: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(_, { diet, foods, schedule, name }) {
        schedule = parse(schedule, "HH:mm", new Date());
        schedule = set(schedule, { year: 2019, month: 2, date: 3});
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
        id: { type: new GraphQLNonNull(GraphQLID)}
      },
      async resolve(_, {id}) {
        return Meal.remove({_id: Types.ObjectId(id)});
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations
});
