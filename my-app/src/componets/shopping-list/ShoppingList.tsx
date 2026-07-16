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

const fontDisplay = "var(--font-display, 'Fraunces', Georgia, serif)";

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
  const remaining = items.filter((i) => !i.purchased).length;

  return (
    <div
      className="min-h-screen bg-[#F3F3EF]"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82]">
          Household
        </p>
        <h1
          className="mt-2 text-[30px] leading-tight text-[#14181C]"
          style={{ fontFamily: fontDisplay }}
        >
          Shopping list
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#5b5c53]">
          {items.length === 0
            ? "One shared list for the house."
            : remaining === 0
              ? "Everything's crossed off."
              : `${remaining} item${remaining === 1 ? "" : "s"} still needed.`}
        </p>

        <div className="mt-8">
          <AddItemForm onAdd={addItem} />
        </div>

        {loading && (
          <div className="mt-6 flex items-center gap-2.5 text-[13.5px] text-[#8B8C82]">
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
            />
            Loading items…
          </div>
        )}
        {error && (
          <p className="mt-6 rounded-md border border-[#C1543C]/25 bg-[#C1543C]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#C1543C]">
            Error loading items: {error.message}
          </p>
        )}

        <div className="mt-6">
          {!loading && items.length === 0 && (
            <p className="rounded-lg border border-dashed border-[#DEDBD1] px-5 py-8 text-center text-[13.5px] text-[#8B8C82]">
              No items added yet — use the form above.
            </p>
          )}

          {items.length > 0 && (
            <div className="rounded-lg border border-[#DEDBD1] bg-white shadow-sm">
              {items.map((item, i) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  onRename={renameItem}
                  isLast={i === items.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}