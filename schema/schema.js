// Schema descreve os dados, tipos, relacionamentos...
// 1 - Define tipos
// 2 - Define relacionamentos entre tipos
// 3 - Define rootqueries

// Rootquery = como o usuário entra no grafo e busca algo
const _ = require("lodash");
const graphql = require("graphql");
const {
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema
} = graphql;
const { Types } = require("mongoose");
const User = require("../models/user");
const Meal = require("../models/meal");
const Diet = require("../models/diet");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
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
    createdAt: { type: GraphQLString },
    user: { type: GraphQLID }
  })
});

const MealType = new GraphQLObjectType({
  name: "Meal",
  fields: () => ({
    id: { type: GraphQLID },
    schedule: { type: GraphQLString },
    foods: { type: GraphQLList(GraphQLString) },
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
      resolve(parent, args) {
        return User.find({});
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
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        let user = new User({
          name: args.name,
          password: args.password
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
      resolve(parent, args) {
        let diet = new Diet({
          name: args.name,
          user: Types.ObjectId(args.user)
        });

        return diet.save();
      }
    },

    addMeal: {
      type: MealType,
      args: {
        diet: { type: new GraphQLNonNull(GraphQLID) },
        foods: { type: new GraphQLList(GraphQLString) },
        schedule: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, { diet, foods, schedule }) {
        let meal = new Meal({
          diet: Types.ObjectId(diet),
          foods,
          schedule
        });

        meal.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations
});
