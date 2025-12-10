// src/features/cart/components/CartDrawer.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/useCartStore';
import {
  useServerCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useClearCart,
} from '@/features/cart/hooks/useServerCart';

export const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Guest cart
  const guestCart = useCartStore();
  const guestItems = guestCart.items;
  const guestTotal = guestCart.getTotal();
  const guestCount = guestCart.getItemCount();

  // Server cart
  const { data: serverData, isLoading } = useServerCart();
  const serverItems = serverData?.items ?? [];
  const serverTotal = serverData?.total ?? 0;
  const serverCount = serverItems.reduce((sum, i) => sum + i.quantity, 0);

  const isGuest = !user;

  const items = isGuest
    ? guestItems.map(i => ({
        id: i._id,
        image: i.menuItem.image,
        name: i.menuItem.name,
        quantity: i.quantity,
        priceAtAdd: i.priceAtAdd,
        menuItemId: i.menuItem._id,
      }))
    : serverItems.map(i => ({
        id: i._id,
        image: i.menuItem.image,
        name: i.menuItem.name,
        quantity: i.quantity,
        priceAtAdd: i.priceAtAdd,
        menuItemId: i.menuItem._id,
      }));

  const total = isGuest ? guestTotal : serverTotal;
  const itemCount = isGuest ? guestCount : serverCount;

  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleQty = (itemId: string, newQty: number) => {
    if (isGuest) {
      if (newQty <= 0) guestCart.removeItem(itemId);
      else guestCart.updateQuantity(itemId, newQty);
      return;
    }

    if (newQty <= 0) removeItem.mutate(itemId);
    else updateQty.mutate({ itemId, quantity: newQty });
  };

  const handleRemove = (itemId: string) =>
    isGuest ? guestCart.removeItem(itemId) : removeItem.mutate(itemId);

  const handleClear = () =>
    isGuest ? guestCart.clearCart() : clearCart.mutate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Your Cart
            </div>
            {itemCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading && !isGuest ? (
            <p className="text-center py-8">Loading cart...</p>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Browse the menu to add items.
              </p>
              <Button className="mt-6" onClick={() => { setOpen(false); navigate('/menu'); }}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Rs. {item.priceAtAdd.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-auto text-destructive"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => { setOpen(false); navigate('/cart'); }}>
                    View Cart
                  </Button>
                  <Button onClick={() => { setOpen(false); navigate('/checkout'); }}>
                    Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
