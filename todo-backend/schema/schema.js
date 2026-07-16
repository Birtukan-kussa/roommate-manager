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
  GraphQLError,
} from "graphql";

// ---------- AUTH GUARDS ----------
const requireAuth = (context) => {
  if (!context.req.user) {
    throw new GraphQLError("Not authenticated. Please log in.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

const requireAdmin = (context) => {
  requireAuth(context);
  if (context.req.user.role !== "admin") {
    throw new GraphQLError("Not authorized. Admin access required.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

// ---------- HOUSEHOLD HELPERS ----------
// Returns the ObjectId of the logged-in user's household
const userHousehold = (context) => context.req.user.household;

// Checks a resource belongs to the current user's household
const assertSameHousehold = (resource, context, label = "Resource") => {
  if (!resource || String(resource.household) !== String(userHousehold(context))) {
    throw new GraphQLError(`${label} not found in your household.`, {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

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
    role: { type: GraphQLString },
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
    createdBy: {
      type: RoommateType,
      resolve(parent) {
        return Roommate.findById(parent.createdBy);
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
    // Roommates — scoped to the logged-in user's household
    roommates: {
      type: new GraphQLList(RoommateType),
      resolve(parent, args, context) {
        requireAuth(context);
        return Roommate.find({ household: userHousehold(context) });
      },
    },
    roommate: {
      type: RoommateType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const roommate = await Roommate.findById(args.id);
        assertSameHousehold(roommate, context, "Roommate");
        return roommate;
      },
    },

    // Chores — scoped to the logged-in user's household
    chores: {
      type: new GraphQLList(ChoreType),
      resolve(parent, args, context) {
        requireAuth(context);
        return Chore.find({ household: userHousehold(context) });
      },
    },
    chore: {
      type: ChoreType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const chore = await Chore.findById(args.id);
        assertSameHousehold(chore, context, "Chore");
        return chore;
      },
    },

    // Expenses — scoped to the logged-in user's household
    expenses: {
      type: new GraphQLList(ExpenseType),
      resolve(parent, args, context) {
        requireAuth(context);
        return Expense.find({ household: userHousehold(context) });
      },
    },
    expense: {
      type: ExpenseType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const expense = await Expense.findById(args.id);
        assertSameHousehold(expense, context, "Expense");
        return expense;
      },
    },

    // Shopping List — scoped to the logged-in user's household
    shoppingItems: {
      type: new GraphQLList(ShoppingItemType),
      resolve(parent, args, context) {
        requireAuth(context);
        return ShoppingItem.find({ household: userHousehold(context) });
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
      resolve(parent, args, context) {
        requireAuth(context);
        const roommate = new Roommate({
          name: args.name,
          email: args.email,
          color: args.color,
          household: userHousehold(context),
        });
        return roommate.save();
      },
    },

    deleteRoommate: {
      type: RoommateType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        requireAdmin(context);
        const roommate = await Roommate.findById(args.id);
        assertSameHousehold(roommate, context, "Roommate");
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
      async resolve(parent, args, context) {
        requireAdmin(context);
        const roommate = await Roommate.findById(args.id);
        assertSameHousehold(roommate, context, "Roommate");

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
      resolve(parent, args, context) {
        requireAuth(context);
        const chore = new Chore({
          title: args.title,
          description: args.description,
          status: args.status,
          assignedTo: args.assignedTo,
          dueDate: args.dueDate,
          recurring: args.recurring,
          createdBy: context.req.user._id,
          household: userHousehold(context),
        });
        return chore.save();
      },
    },

    deleteChore: {
      type: ChoreType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const chore = await Chore.findById(args.id);
        assertSameHousehold(chore, context, "Chore");
        const isAdmin = context.req.user.role === "admin";
        const isOwner = String(chore.createdBy) === String(context.req.user._id);
        if (!isAdmin && !isOwner) {
          throw new GraphQLError("Not authorized. You can only delete chores you created.", {
            extensions: { code: "FORBIDDEN" },
          });
        }
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
      async resolve(parent, args, context) {
        requireAuth(context);
        const chore = await Chore.findById(args.id);
        assertSameHousehold(chore, context, "Chore");
        const isAdmin = context.req.user.role === "admin";
        const isOwner = String(chore.createdBy) === String(context.req.user._id);

        // Non-owners can only update status
        if (!isAdmin && !isOwner) {
          if (
            args.title !== undefined ||
            args.description !== undefined ||
            args.assignedTo !== undefined ||
            args.dueDate !== undefined ||
            args.recurring !== undefined
          ) {
            throw new GraphQLError("Not authorized. You can only update the status of this chore.", {
              extensions: { code: "FORBIDDEN" },
            });
          }
        }

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
      resolve(parent, args, context) {
        requireAuth(context);
        const expense = new Expense({
          title: args.title,
          amount: args.amount,
          paidBy: args.paidBy,
          splitBetween: args.splitBetween,
          household: userHousehold(context),
        });
        return expense.save();
      },
    },

    deleteExpense: {
      type: ExpenseType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const expense = await Expense.findById(args.id);
        assertSameHousehold(expense, context, "Expense");
        const isAdmin = context.req.user.role === "admin";
        const isOwner = String(expense.paidBy) === String(context.req.user._id);
        if (!isAdmin && !isOwner) {
          throw new GraphQLError("Not authorized. You can only delete expenses you paid for.", {
            extensions: { code: "FORBIDDEN" },
          });
        }
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
      async resolve(parent, args, context) {
        requireAuth(context);
        const expense = await Expense.findById(args.id);
        assertSameHousehold(expense, context, "Expense");
        const isAdmin = context.req.user.role === "admin";
        const isOwner = String(expense.paidBy) === String(context.req.user._id);
        if (!isAdmin && !isOwner) {
          throw new GraphQLError("Not authorized. You can only edit expenses you paid for.", {
            extensions: { code: "FORBIDDEN" },
          });
        }
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
      resolve(parent, args, context) {
        requireAuth(context);
        const item = new ShoppingItem({
          name: args.name,
          addedBy: args.addedBy || context.req.user._id,
          household: userHousehold(context),
        });
        return item.save();
      },
    },

    deleteShoppingItem: {
      type: ShoppingItemType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const item = await ShoppingItem.findById(args.id);
        assertSameHousehold(item, context, "Shopping item");
        const isAdmin = context.req.user.role === "admin";
        const isOwner = String(item.addedBy) === String(context.req.user._id);
        if (!isAdmin && !isOwner) {
          throw new GraphQLError("Not authorized. You can only delete your own items.", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        return ShoppingItem.findByIdAndDelete(args.id);
      },
    },

    togglePurchased: {
      type: ShoppingItemType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        requireAuth(context);
        const item = await ShoppingItem.findById(args.id);
        assertSameHousehold(item, context, "Shopping item");
        item.purchased = !item.purchased;
        return item.save();
      },
    },

    updateShoppingItem: {
      type: ShoppingItemType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        requireAuth(context);
        const item = await ShoppingItem.findById(args.id);
        assertSameHousehold(item, context, "Shopping item");
        const isAdmin = context.req.user.role === "admin";
        const isOwner = String(item.addedBy) === String(context.req.user._id);
        if (!isAdmin && !isOwner) {
          throw new GraphQLError("Not authorized. You can only edit your own items.", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        const updateFields = {};
        if (args.name !== undefined) updateFields.name = args.name;
        return ShoppingItem.findByIdAndUpdate(
          args.id,
          { $set: updateFields },
          { new: true }
        );
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;