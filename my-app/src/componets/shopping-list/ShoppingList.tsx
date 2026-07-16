"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SHOPPING_ITEMS } from "@/graphql/shoppingQueries";
import {
  ADD_SHOPPING_ITEM,
  DELETE_SHOPPING_ITEM,
  TOGGLE_PURCHASED,
  UPDATE_SHOPPING_ITEM,
} from "@/graphql/shoppingMutations";
import AddItemForm from "../shopping-list/AddItemForm";
import ShoppingItem from "../shopping-list/ShoppingItem";
import { useAuth } from "@/lib/AuthContext";

export type Item = {
  id: string;
  name: string;
  purchased: boolean;
  addedBy?: { id: string; name: string; color: string } | null;
  createdAt?: string;
};

export default function ShoppingList() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery<{ shoppingItems: Item[] }>(GET_SHOPPING_ITEMS);

  const [addShoppingItem] = useMutation(ADD_SHOPPING_ITEM, {
    refetchQueries: [{ query: GET_SHOPPING_ITEMS }],
  });
  const [deleteShoppingItem] = useMutation(DELETE_SHOPPING_ITEM, {
    refetchQueries: [{ query: GET_SHOPPING_ITEMS }],
  });
  const [togglePurchased] = useMutation(TOGGLE_PURCHASED, {
    refetchQueries: [{ query: GET_SHOPPING_ITEMS }],
  });
  const [updateShoppingItem] = useMutation(UPDATE_SHOPPING_ITEM, {
    refetchQueries: [{ query: GET_SHOPPING_ITEMS }],
  });

  async function addItem(name: string) {
    await addShoppingItem({
      variables: { name, addedBy: user?._id || undefined },
    });
  }

  async function toggleItem(id: string) {
    await togglePurchased({ variables: { id } });
  }

  async function deleteItem(id: string) {
    await deleteShoppingItem({ variables: { id } });
  }

  async function renameItem(id: string, name: string) {
    await updateShoppingItem({ variables: { id, name } });
  }

  const items: Item[] = data?.shoppingItems ?? [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {loading && <p className="text-gray-400 mt-4">Loading items…</p>}
      {error && <p className="text-red-400 mt-4">Error loading items: {error.message}</p>}

      <div className="mt-6 space-y-2">
        {!loading && items.length === 0 && (
          <p className="text-gray-400">No items added yet.</p>
        )}
        {items.map((item) => (
          <ShoppingItem
            key={item.id}
            item={item}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onRename={renameItem}
          />
        ))}
      </div>
    </div>
  );
}