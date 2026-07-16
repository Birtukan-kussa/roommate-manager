import { Roommate } from "../models/Roommate.js";
import { Chore } from "../models/Chore.js";
import { Expense } from "../models/Expense.js";
import { ShoppingItem } from "../models/ShoppingItem.js";
import { sendNotificationEmail } from "../server/emailService.js";

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
    assignedTo: {
      type: RoommateType,
      resolve(parent) {
        return Roommate.findById(parent.assignedTo);
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
          password: "password123", // Default password so they can log in
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
      async resolve(parent, args, context) {
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
        const savedChore = await chore.save();
        
        if (args.assignedTo) {
          const assignee = await Roommate.findById(args.assignedTo);
          if (assignee && assignee.email) {
            await sendNotificationEmail(
              assignee.email, 
              "You have a new chore assigned!", 
              `Hi ${assignee.name},\n\nYou have been assigned a new chore: ${args.title}.\nDue date: ${args.dueDate || 'Not set'}.\n\nPlease check your SmartSplit dashboard for details.`
            );
          }
        }
        
        return savedChore;
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

        const updatedChore = await Chore.findByIdAndUpdate(
          args.id,
          { $set: updateFields },
          { new: true }
        );
        
        if (args.assignedTo && String(chore.assignedTo) !== String(args.assignedTo)) {
           const assignee = await Roommate.findById(args.assignedTo);
           if (assignee && assignee.email) {
             await sendNotificationEmail(
               assignee.email, 
               "You have a new chore assigned!", 
               `Hi ${assignee.name},\n\nYou have been assigned the chore: ${updatedChore.title}.\nDue date: ${updatedChore.dueDate || 'Not set'}.\n\nPlease check your SmartSplit dashboard for details.`
             );
           }
        }
        
        return updatedChore;
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
        assignedTo: { type: GraphQLID },
      },
      async resolve(parent, args, context) {
        requireAuth(context);
        const item = new ShoppingItem({
          name: args.name,
          addedBy: args.addedBy || context.req.user._id,
          assignedTo: args.assignedTo,
          household: userHousehold(context),
        });
        const savedItem = await item.save();
        
        if (args.assignedTo) {
          const assignee = await Roommate.findById(args.assignedTo);
          if (assignee && assignee.email) {
            await sendNotificationEmail(
              assignee.email, 
              "New Shopping Duty!", 
              `Hi ${assignee.name},\n\nYou have been requested to pick up a new item for the house: ${args.name}.\n\nPlease check your SmartSplit dashboard for details.`
            );
          }
        }
        
        return savedItem;
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
        assignedTo: { type: GraphQLID },
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
        if (args.assignedTo !== undefined) updateFields.assignedTo = args.assignedTo;
        
        const updatedItem = await ShoppingItem.findByIdAndUpdate(
          args.id,
          { $set: updateFields },
          { new: true }
        );
        
        if (args.assignedTo && String(item.assignedTo) !== String(args.assignedTo)) {
           const assignee = await Roommate.findById(args.assignedTo);
           if (assignee && assignee.email) {
             await sendNotificationEmail(
               assignee.email, 
               "Shopping Duty Update!", 
               `Hi ${assignee.name},\n\nYou are now responsible for picking up: ${updatedItem.name}.\n\nPlease check your SmartSplit dashboard for details.`
             );
           }
        }
        
        return updatedItem;
      },
    },

    // ----- Custom Admin Notifications -----
    sendAdminNotification: {
      type: GraphQLBoolean,
      args: {
        roommateId: { type: GraphQLID }, // Optional. If not provided, send to all.
        message: { type: GraphQLNonNull(GraphQLString) },
        subject: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        requireAdmin(context); // only admins can send manual notifications
        
        const subject = args.subject || "Message from SmartSplit Admin";
        const messageText = `${args.message}\n\n--\nSent from SmartSplit`;
        
        if (args.roommateId) {
          const roommate = await Roommate.findById(args.roommateId);
          if (!roommate) {
            throw new Error("Roommate not found");
          }
          if (!roommate.email) {
            throw new Error(`Roommate ${roommate.name} does not have an email address.`);
          }
          const success = await sendNotificationEmail(roommate.email, subject, messageText);
          if (!success) {
            throw new Error("Failed to send email. Please ensure SMTP credentials are configured in your backend .env file.");
          }
        } else {
          // Send to everyone
          const roommates = await Roommate.find({ email: { $exists: true, $ne: null } });
          if (roommates.length === 0) {
            throw new Error("No roommates with email addresses found.");
          }
          let failCount = 0;
          for (let r of roommates) {
            const success = await sendNotificationEmail(r.email, subject, messageText);
            if (!success) failCount++;
          }
          if (failCount === roommates.length) {
            throw new Error("Failed to send emails to any roommates. Please check your backend SMTP settings.");
          } else if (failCount > 0) {
            throw new Error(`Email sent, but failed to deliver to ${failCount} roommates.`);
          }
        }
        return true;
      }
    },

    // ----- Public Contact Us Mutation -----
    submitContactMessage: {
      type: GraphQLBoolean,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const adminEmail = process.env.SMTP_USER || "admin@smartsplit.app";
        
        const subject = `SmartSplit Contact Form: ${args.subject || 'New Message'} from ${args.name}`;
        const messageText = `You have received a new contact message:\n\n` +
          `Name: ${args.name}\n` +
          `Email: ${args.email}\n\n` +
          `Message:\n${args.message}\n\n` +
          `--\nSent from SmartSplit Public Portal`;
        
        const success = await sendNotificationEmail(adminEmail, subject, messageText);
        if (!success) {
          throw new Error("Failed to send contact message. If in local development, verify your backend .env file has SMTP configured.");
        }
        return true;
      }
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;