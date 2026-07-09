import { Roommate } from "../models/Roommate.js";
import { Chore } from "../models/Chore.js";
import { Expense } from "../models/Expense.js";
import { ShoppingItem } from "../models/ShoppingItem.js";

import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
} from "graphql";

// ---------- ENUMS ----------
const ChoreStatusEnum = new GraphQLEnumType({
  name: "ChoreStatus",
  values: {
    NOT_STARTED: { value: "Not Started" },
    IN_PROGRESS: { value: "In Progress" },
    COMPLETED: { value: "Completed" },
  },
});

const RecurringEnum = new GraphQLEnumType({
  name: "RecurringType",
  values: {
    NONE: { value: "None" },
    DAILY: { value: "Daily" },
    WEEKLY: { value: "Weekly" },
    MONTHLY: { value: "Monthly" },
  },
});

// ---------- TYPES ----------
const RoommateType = new GraphQLObjectType({
  name: "Roommate",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    color: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

const ChoreType = new GraphQLObjectType({
  name: "Chore",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    dueDate: { type: GraphQLString },
    recurring: { type: GraphQLString },
    assignedTo: {
      type: RoommateType,
      resolve(parent) {
        return Roommate.findById(parent.assignedTo);
      },
    },
    createdAt: { type: GraphQLString },
  }),
});

const ExpenseType = new GraphQLObjectType({
  name: "Expense",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    paidBy: {
      type: RoommateType,
      resolve(parent) {
        return Roommate.findById(parent.paidBy);
      },
    },
    splitBetween: {
      type: new GraphQLList(RoommateType),
      resolve(parent) {
        return Roommate.find({ _id: { $in: parent.splitBetween } });
      },
    },
    date: { type: GraphQLString },
  }),
});

const ShoppingItemType = new GraphQLObjectType({
  name: "ShoppingItem",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    purchased: { type: GraphQLBoolean },
    addedBy: {
      type: RoommateType,
      resolve(parent) {
        return Roommate.findById(parent.addedBy);
      },
    },
    createdAt: { type: GraphQLString },
  }),
});

// ---------- ROOT QUERY ----------
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // Roommates
    roommates: {
      type: new GraphQLList(RoommateType),
      resolve() {
        return Roommate.find();
      },
    },
    roommate: {
      type: RoommateType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Roommate.findById(args.id);
      },
    },

    // Chores
    chores: {
      type: new GraphQLList(ChoreType),
      resolve() {
        return Chore.find();
      },
    },
    chore: {
      type: ChoreType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Chore.findById(args.id);
      },
    },

    // Expenses
    expenses: {
      type: new GraphQLList(ExpenseType),
      resolve() {
        return Expense.find();
      },
    },
    expense: {
      type: ExpenseType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Expense.findById(args.id);
      },
    },

    // Shopping List
    shoppingItems: {
      type: new GraphQLList(ShoppingItemType),
      resolve() {
        return ShoppingItem.find();
      },
    },
  },
});

// ---------- ROOT MUTATION ----------
const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // ----- Roommate Mutations -----
    addRoommate: {
      type: RoommateType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
        color: { type: GraphQLString },
      },
      resolve(parent, args) {
        const roommate = new Roommate({
          name: args.name,
          email: args.email,
          color: args.color,
        });
        return roommate.save();
      },
    },

    deleteRoommate: {
      type: RoommateType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Roommate.findByIdAndDelete(args.id);
      },
    },

    updateRoommate: {
      type: RoommateType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        color: { type: GraphQLString },
      },
      resolve(parent, args) {
        const updateFields = {};
        if (args.name !== undefined) updateFields.name = args.name;
        if (args.email !== undefined) updateFields.email = args.email;
        if (args.color !== undefined) updateFields.color = args.color;

        return Roommate.findByIdAndUpdate(
          args.id,
          { $set: updateFields },
          { new: true }
        );
      },
    },

    // ----- Chore Mutations -----
    addChore: {
      type: ChoreType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        status: { type: ChoreStatusEnum, defaultValue: "Not Started" },
        assignedTo: { type: GraphQLID },
        dueDate: { type: GraphQLString },
        recurring: { type: RecurringEnum, defaultValue: "None" },
      },
      resolve(parent, args) {
        const chore = new Chore({
          title: args.title,
          description: args.description,
          status: args.status,
          assignedTo: args.assignedTo,
          dueDate: args.dueDate,
          recurring: args.recurring,
        });
        return chore.save();
      },
    },

    deleteChore: {
      type: ChoreType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Chore.findByIdAndDelete(args.id);
      },
    },

    updateChore: {
      type: ChoreType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: ChoreStatusEnum },
        assignedTo: { type: GraphQLID },
        dueDate: { type: GraphQLString },
        recurring: { type: RecurringEnum },
      },
      resolve(parent, args) {
        const updateFields = {};
        if (args.title !== undefined) updateFields.title = args.title;
        if (args.description !== undefined) updateFields.description = args.description;
        if (args.status !== undefined) updateFields.status = args.status;
        if (args.assignedTo !== undefined) updateFields.assignedTo = args.assignedTo;
        if (args.dueDate !== undefined) updateFields.dueDate = args.dueDate;
        if (args.recurring !== undefined) updateFields.recurring = args.recurring;

        return Chore.findByIdAndUpdate(
          args.id,
          { $set: updateFields },
          { new: true }
        );
      },
    },

    // ----- Expense Mutations -----
    addExpense: {
      type: ExpenseType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        amount: { type: GraphQLNonNull(GraphQLFloat) },
        paidBy: { type: GraphQLNonNull(GraphQLID) },
        splitBetween: { type: new GraphQLList(GraphQLID) },
      },
      resolve(parent, args) {
        const expense = new Expense({
          title: args.title,
          amount: args.amount,
          paidBy: args.paidBy,
          splitBetween: args.splitBetween,
        });
        return expense.save();
      },
    },

    deleteExpense: {
      type: ExpenseType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Expense.findByIdAndDelete(args.id);
      },
    },

    updateExpense: {
      type: ExpenseType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        amount: { type: GraphQLFloat },
        paidBy: { type: GraphQLID },
        splitBetween: { type: new GraphQLList(GraphQLID) },
      },
      resolve(parent, args) {
        const updateFields = {};
        if (args.title !== undefined) updateFields.title = args.title;
        if (args.amount !== undefined) updateFields.amount = args.amount;
        if (args.paidBy !== undefined) updateFields.paidBy = args.paidBy;
        if (args.splitBetween !== undefined) updateFields.splitBetween = args.splitBetween;

        return Expense.findByIdAndUpdate(
          args.id,
          { $set: updateFields },
          { new: true }
        );
      },
    },

    // ----- Shopping List Mutations -----
    addShoppingItem: {
      type: ShoppingItemType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        addedBy: { type: GraphQLID },
      },
      resolve(parent, args) {
        const item = new ShoppingItem({
          name: args.name,
          addedBy: args.addedBy,
        });
        return item.save();
      },
    },

    deleteShoppingItem: {
      type: ShoppingItemType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return ShoppingItem.findByIdAndDelete(args.id);
      },
    },

    togglePurchased: {
      type: ShoppingItemType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args) {
        const item = await ShoppingItem.findById(args.id);
        if (!item) throw new Error("Item not found");
        item.purchased = !item.purchased;
        return item.save();
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;