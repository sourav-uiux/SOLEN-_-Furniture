import React, { useEffect, useState } from 'react';
import { getProductById, PRODUCTS } from './data/catalog';
import {
  CartItem,
  JournalArticle,
  OrderRecord,
  PageView,
  Product,
  ProductConfiguration,
  SavedConfiguration,
  SpaceCategory,
  UserAccount,
} from './types/furniture';
import {
  calculateConfiguredPrice,
  createCartItemKey,
} from './utils/commerce';
import { Navbar } from './components/Navbar';
import { ShowroomExperience } from './components/ShowroomExperience';
import { RoomsAndCollections } from './components/RoomsAndCollections';
import { MaterialsAndStory } from './components/MaterialsAndStory';
import { SpacesExplorerView } from './components/SpacesExplorerView';
import { CatalogView } from './components/CatalogView';
import { ProductDetailView } from './components/ProductDetailView';
import { AiStudioView } from './components/AiStudioView';
import { JournalView, StoryView } from './components/JournalAndStoryViews';
import {
  AccountDrawer,
  BagDrawer,
  CheckoutModal,
  SearchOverlay,
  WishlistDrawer,
} from './components/Overlays';

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('showroom');
  const [catalogCategory, setCatalogCategory] = useState<SpaceCategory | 'All'>('All');
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [selectedProductConfig, setSelectedProductConfig] = useState<
    ProductConfiguration | undefined
  >(undefined);
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

  // Live signature sofa configuration shared between 3D Showroom and PDP
  const [sofaConfig, setSofaConfig] = useState<ProductConfiguration>(
    PRODUCTS[0].defaultConfig
  );

  // Persistent Commerce State
  const [bagItems, setBagItems] = useState<CartItem[]>(() =>
    loadStoredJson<CartItem[]>('solen_bag', [])
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    loadStoredJson<string[]>('solen_wishlist', ['aurel-lounge-sofa', 'mono-coffee-table'])
  );
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>(() =>
    loadStoredJson<SavedConfiguration[]>('solen_saved_configs', [])
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadStoredJson<OrderRecord[]>('solen_orders', [])
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadStoredJson<string[]>('solen_recent_searches', [])
  );
  const [account, setAccount] = useState<UserAccount>(() =>
    loadStoredJson<UserAccount>('solen_account', {
      signedIn: false,
      name: '',
      email: '',
      savedAddresses: [
        {
          id: 'addr-1',
          label: 'Primary Residence',
          street: '412 Mercer Street, Loft 4B',
          city: 'New York',
          postalCode: '10013',
          country: 'United States',
        },
      ],
    })
  );

  // Overlay States
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('solen_bag', JSON.stringify(bagItems));
    } catch {
      // ignore storage quota errors
    }
  }, [bagItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem('solen_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem('solen_saved_configs', JSON.stringify(savedConfigs));
    } catch {
      // ignore
    }
  }, [savedConfigs]);

  useEffect(() => {
    try {
      window.localStorage.setItem('solen_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      window.localStorage.setItem('solen_recent_searches', JSON.stringify(recentSearches));
    } catch {
      // ignore
    }
  }, [recentSearches]);

  useEffect(() => {
    try {
      window.localStorage.setItem('solen_account', JSON.stringify(account));
    } catch {
      // ignore
    }
  }, [account]);

  const navigateTo = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleOpenProduct = (
    productId: string,
    initialConfig?: ProductConfiguration
  ) => {
    setSelectedProductId(productId);
    setSelectedProductConfig(initialConfig);
    navigateTo('product');
  };

  const handleOpenCollection = (category: SpaceCategory | 'All') => {
    setCatalogCategory(category);
    navigateTo('collections');
  };

  const handleAddToBag = (
    product: Product,
    config: ProductConfiguration,
    qty = 1
  ) => {
    const unitPrice = calculateConfiguredPrice(product, config);
    const key = createCartItemKey(product.id, config);

    setBagItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === key);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === key ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          cartItemId: key,
          productId: product.id,
          quantity: qty,
          config,
          unitPrice,
        },
      ];
    });
    setBagOpen(true);
  };

  const handleUpdateBagQty = (cartItemId: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveBagItem = (cartItemId: string) => {
    setBagItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveConfiguration = (
    product: Product,
    config: ProductConfiguration,
    unitPrice: number
  ) => {
    const entry: SavedConfiguration = {
      id: `cfg-${Date.now()}`,
      productId: product.id,
      name: product.name,
      config,
      unitPrice,
      savedAt: new Date().toLocaleDateString('en-US'),
    };
    setSavedConfigs((prev) => [entry, ...prev]);
  };

  const bagCount = bagItems.reduce((sum, i) => sum + i.quantity, 0);
  const currentProduct = getProductById(selectedProductId) ?? PRODUCTS[0];

  return (
    <div
      data-view={currentView}
      className="min-h-screen bg-[#F6F4EF] text-[#242421]"
    >
      <Navbar
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'collections') setCatalogCategory('All');
          navigateTo(v);
        }}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenBag={() => setBagOpen(true)}
        bagCount={bagCount}
        wishlistCount={wishlistIds.length}
        isOverShowroom={currentView === 'showroom' || currentView === 'spaces'}
      />

      {currentView === 'showroom' && (
        <main>
          <ShowroomExperience
            sofaConfig={sofaConfig}
            onUpdateSofaConfig={setSofaConfig}
            onAddToBag={handleAddToBag}
            onOpenProduct={handleOpenProduct}
            onNavigate={navigateTo}
          />
          <RoomsAndCollections
            onSelectCollection={(cat) => handleOpenCollection(cat)}
            onOpenSpacesExplorer={() => navigateTo('spaces')}
          />
          <MaterialsAndStory
            onNavigate={navigateTo}
            onOpenArticle={(article) => {
              setActiveArticle(article);
              navigateTo('journal');
            }}
          />
        </main>
      )}

      {currentView === 'spaces' && (
        <SpacesExplorerView
          sofaConfig={sofaConfig}
          onOpenProduct={(pid) => handleOpenProduct(pid)}
          onAddToBag={handleAddToBag}
        />
      )}

      {currentView === 'collections' && (
        <CatalogView
          key={catalogCategory}
          initialCategory={catalogCategory}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onOpenProduct={(pid) => handleOpenProduct(pid)}
          onAddToBag={handleAddToBag}
        />
      )}

      {currentView === 'product' && (
        <ProductDetailView
          key={`${currentProduct.id}-${JSON.stringify(selectedProductConfig ?? {})}`}
          product={currentProduct}
          initialConfig={selectedProductConfig}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onAddToBag={handleAddToBag}
          onSaveConfiguration={handleSaveConfiguration}
          onOpenProduct={(pid) => handleOpenProduct(pid)}
          onBackToCatalog={() => navigateTo('collections')}
        />
      )}

      {currentView === 'studio' && <AiStudioView />}

      {currentView === 'story' && <StoryView onNavigate={navigateTo} />}

      {currentView === 'journal' && (
        <JournalView
          activeArticle={activeArticle}
          onSelectArticle={setActiveArticle}
        />
      )}

      {/* Global Overlays */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        recentSearches={recentSearches}
        onRecordSearch={(term) =>
          setRecentSearches((prev) =>
            [term, ...prev.filter((t) => t !== term)].slice(0, 6)
          )
        }
        onSelectProduct={(pid) => handleOpenProduct(pid)}
        onSelectCollection={(cat) => handleOpenCollection(cat)}
      />

      <BagDrawer
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        items={bagItems}
        onUpdateQty={handleUpdateBagQty}
        onRemoveItem={handleRemoveBagItem}
        onProceedToCheckout={() => {
          setBagOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={bagItems}
        onOrderCompleted={(order) => {
          setOrders((prev) => [order, ...prev]);
          setBagItems([]);
        }}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistIds={wishlistIds}
        onRemoveWishlist={handleToggleWishlist}
        onMoveToBag={(pid) => {
          const p = getProductById(pid);
          if (p) {
            setWishlistOpen(false);
            handleAddToBag(p, p.defaultConfig, 1);
          }
        }}
        onOpenProduct={(pid) => handleOpenProduct(pid)}
      />

      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        account={account}
        onUpdateAccount={setAccount}
        orders={orders}
        savedConfigs={savedConfigs}
        onLoadConfig={(saved) => handleOpenProduct(saved.productId, saved.config)}
      />
    </div>
  );
}
