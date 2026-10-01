import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Tab = 'home' | 'menu' | 'orders' | 'profile';
type FoodItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
  isVeg: boolean;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
const WHATSAPP_URL = 'https://wa.me/919014822734?text=Hello%20RestoMaster%2C%20I%20need%20assistance.';

const sampleItems: FoodItem[] = [
  { id: 'dish-1', name: 'Hyderabadi Dum Chicken Biryani', description: 'Saffron basmati, tender chicken, caramelized shallots and cooling raita.', category: 'Biryani', price: 349, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80', isVeg: false },
  { id: 'dish-2', name: 'Nawabi Paneer Tikka Biryani', description: 'Charcoal-smoked paneer, fragrant rice, cashews and fresh mint.', category: 'Biryani', price: 299, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=700&q=80', isVeg: true },
  { id: 'dish-3', name: 'Tandoori Chicken Platter', description: 'Clay-oven chicken with mint chutney and pickled onions.', category: 'Starters', price: 429, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=700&q=80', isVeg: false },
  { id: 'dish-4', name: 'Butter Chicken Royale', description: 'Slow-cooked chicken in a silky tomato, butter and cream sauce.', category: 'Mains', price: 389, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80', isVeg: false },
  { id: 'dish-5', name: 'Saffron Gulab Jamun', description: 'Warm rose-scented dumplings with pistachio and saffron syrup.', category: 'Desserts', price: 179, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1601303516534-9b7c2c7f0f96?auto=format&fit=crop&w=700&q=80', isVeg: true },
];

const categories = ['All', 'Biryani', 'Starters', 'Mains', 'Desserts'];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [items, setItems] = useState<FoodItem[]>(sampleItems);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loginName, setLoginName] = useState('customer@restomaster.io');
  const [loginPassword, setLoginPassword] = useState('Customer@123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!token || token === 'demo') return;

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/outlets/active`, { headers }).then((response) => response.json()),
      fetch(`${API_URL}/menu/items?active=true&available=true&size=100`, { headers }).then((response) => response.json()),
    ])
      .then(([outletPayload, menuPayload]) => {
        const activeOutlets = Array.isArray(outletPayload?.data) ? outletPayload.data : [];
        const selectedOutlet = activeOutlets.find((outlet: any) => outlet.code === 'OUT-001') || activeOutlets[0];
        if (selectedOutlet?.id) setOutletId(String(selectedOutlet.id));

        const remoteItems = menuPayload?.data?.content || menuPayload?.data || menuPayload?.content;
        if (Array.isArray(remoteItems) && remoteItems.length > 0) {
          setItems(remoteItems.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            description: item.description || 'Freshly prepared by our kitchen.',
            category: item.categoryName || item.category || 'Chef Specials',
            price: Number(item.price),
            rating: Number(item.rating || 4.7),
            imageUrl: item.imageUrl || sampleItems[0].imageUrl,
            isVeg: Boolean(item.isVeg),
          })));
        }
      })
      .catch(() => undefined);
  }, [token]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, items, query]);

  const cartItems = items.filter((item) => cart[item.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);

  const addToCart = (item: FoodItem) => setCart((current) => ({ ...current, [item.id]: (current[item.id] || 0) + 1 }));
  const removeFromCart = (item: FoodItem) => setCart((current) => {
    const next = { ...current };
    if (next[item.id] > 1) next[item.id] -= 1;
    else delete next[item.id];
    return next;
  });

  const placeOrder = async () => {
    if (!cartCount) return;
    setIsSubmitting(true);
    const localOrderNumber = `RM-${Date.now().toString().slice(-6)}`;

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          outletId: outletId || 'out-001',
          orderType: 'DELIVERY',
          customerName: 'Surya',
          customerPhone: '+91 98765 43210',
          guestCount: 1,
          notes: 'Placed from RestoMaster mobile app',
          items: cartItems.map((item) => ({ menuItemId: item.id, quantity: cart[item.id], notes: '', selectedModifierIds: [] })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'The backend rejected this order.');
      const orderNumber = payload?.data?.orderNumber || payload?.data?.id || localOrderNumber;
      setOrders((current) => [String(orderNumber), ...current]);
      setCart({});
      setCartOpen(false);
      setTab('orders');
      Alert.alert('Order received', 'Your kitchen has received the order. We will keep you updated.');
    } catch (error) {
      setOrders((current) => [localOrderNumber, ...current]);
      setCart({});
      setCartOpen(false);
      setTab('orders');
      Alert.alert('Demo order saved', error instanceof Error ? `${error.message}\n\nThis order is saved locally until customer ordering is enabled on the backend.` : 'This order is saved locally until customer ordering is enabled on the backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: loginName.trim(), password: loginPassword }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.data?.accessToken) throw new Error(payload?.message || 'Unable to sign in.');
      setToken(payload.data.accessToken);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!token) {
    return <LoginScreen name={loginName} password={loginPassword} error={loginError} isLoading={isLoggingIn} onNameChange={setLoginName} onPasswordChange={setLoginPassword} onLogin={login} onDemo={() => setToken('demo')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>RESTOMASTER</Text>
            <Text style={styles.title}>Good evening, Surya</Text>
          </View>
          <Pressable style={styles.supportButton} onPress={() => Linking.openURL(WHATSAPP_URL)}>
            <Text style={styles.supportText}>WhatsApp</Text>
          </Pressable>
        </View>

        {tab === 'home' && (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <Text style={styles.heroKicker}>CHENNAI CENTRAL FLAGSHIP</Text>
              <Text style={styles.heroTitle}>Royal flavours, ready when you are.</Text>
              <Text style={styles.heroBody}>Fresh biryanis, clay-oven favourites and a table waiting for you.</Text>
              <Pressable style={styles.primaryButton} onPress={() => setTab('menu')}><Text style={styles.primaryButtonText}>Explore the menu</Text></Pressable>
            </View>
            <SectionTitle title="Popular tonight" action="See all" onPress={() => setTab('menu')} />
            <FlatList horizontal data={items.slice(0, 4)} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList} renderItem={({ item }) => <FoodCard item={item} onAdd={() => addToCart(item)} compact />} />
            <SectionTitle title="Dine with us" />
            <View style={styles.infoRow}><Text style={styles.infoIcon}>⌖</Text><View><Text style={styles.infoTitle}>Chennai Central Flagship</Text><Text style={styles.infoBody}>14, Khader Nawaz Khan Road · Open until 11:30 PM</Text></View></View>
          </ScrollView>
        )}

        {tab === 'menu' && <View style={styles.flex}><View style={styles.menuTop}><Text style={styles.pageTitle}>Menu</Text><Pressable style={styles.cartButton} onPress={() => setCartOpen(true)}><Text style={styles.cartButtonText}>Cart {cartCount ? `(${cartCount})` : ''}</Text></Pressable></View><TextInput value={query} onChangeText={setQuery} placeholder="Search biryani, pizza, desserts..." placeholderTextColor="#8e8a82" style={styles.search} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</ScrollView><FlatList data={filteredItems} keyExtractor={(item) => item.id} contentContainerStyle={styles.menuList} renderItem={({ item }) => <FoodCard item={item} onAdd={() => addToCart(item)} />} /></View>}

        {tab === 'orders' && <ScrollView contentContainerStyle={styles.content}><Text style={styles.pageTitle}>Your orders</Text>{orders.length === 0 ? <EmptyState text="Your next feast belongs here." action="Browse menu" onPress={() => setTab('menu')} /> : orders.map((order) => <View style={styles.orderCard} key={order}><View><Text style={styles.orderLabel}>ORDER PLACED</Text><Text style={styles.orderNumber}>{order}</Text></View><View style={styles.statusPill}><Text style={styles.statusText}>Preparing</Text></View></View>)}</ScrollView>}

        {tab === 'profile' && <ScrollView contentContainerStyle={styles.content}><Text style={styles.pageTitle}>Profile</Text><View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View><View><Text style={styles.profileName}>Surya</Text><Text style={styles.profileEmail}>surya.customer@restomaster.com</Text></View></View>{['Saved addresses', 'Favourite dishes', 'Offers & rewards', 'Help & support'].map((item) => <Pressable key={item} style={styles.profileRow} onPress={() => item === 'Help & support' && Linking.openURL(WHATSAPP_URL)}><Text style={styles.profileRowText}>{item}</Text><Text style={styles.chevron}>›</Text></Pressable>)}</ScrollView>}

        <View style={styles.bottomNav}>{([['home', 'Home'], ['menu', 'Menu'], ['orders', 'Orders'], ['profile', 'Profile']] as [Tab, string][]).map(([key, label]) => <Pressable key={key} onPress={() => setTab(key)} style={styles.navItem}><Text style={[styles.navLabel, tab === key && styles.navLabelActive]}>{label}</Text>{key === 'menu' && cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</Pressable>)}</View>
      </View>
      <Modal visible={cartOpen} animationType="slide" transparent onRequestClose={() => setCartOpen(false)}><View style={styles.modalBackdrop}><View style={styles.cartSheet}><View style={styles.sheetHeader}><Text style={styles.pageTitle}>Your cart</Text><Pressable onPress={() => setCartOpen(false)}><Text style={styles.close}>Close</Text></Pressable></View>{cartItems.map((item) => <View style={styles.cartRow} key={item.id}><View style={styles.cartInfo}><Text style={styles.cartName}>{item.name}</Text><Text style={styles.cartPrice}>₹{item.price} × {cart[item.id]}</Text></View><View style={styles.quantity}><Pressable onPress={() => removeFromCart(item)}><Text style={styles.quantityButton}>−</Text></Pressable><Text style={styles.quantityValue}>{cart[item.id]}</Text><Pressable onPress={() => addToCart(item)}><Text style={styles.quantityButton}>+</Text></Pressable></View></View>)}<View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{cartTotal}</Text></View><Pressable style={[styles.primaryButton, isSubmitting && styles.disabledButton]} onPress={placeOrder} disabled={isSubmitting}><Text style={styles.primaryButtonText}>{isSubmitting ? 'Sending order...' : 'Place order'}</Text></Pressable></View></View></Modal>
    </SafeAreaView>
  );
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) { return <View style={styles.sectionTitle}><Text style={styles.sectionHeading}>{title}</Text>{action && <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable>}</View>; }
function EmptyState({ text, action, onPress }: { text: string; action: string; onPress: () => void }) { return <View style={styles.empty}><Text style={styles.emptyText}>{text}</Text><Pressable style={styles.primaryButton} onPress={onPress}><Text style={styles.primaryButtonText}>{action}</Text></Pressable></View>; }
function LoginScreen({ name, password, error, isLoading, onNameChange, onPasswordChange, onLogin, onDemo }: { name: string; password: string; error: string; isLoading: boolean; onNameChange: (value: string) => void; onPasswordChange: (value: string) => void; onLogin: () => void; onDemo: () => void }) { return <SafeAreaView style={styles.safeArea}><StatusBar style="light" /><View style={styles.loginScreen}><Text style={styles.eyebrow}>RESTOMASTER</Text><Text style={styles.loginTitle}>Your table is ready.</Text><Text style={styles.loginBody}>Sign in to order from the Chennai Central Flagship.</Text><TextInput value={name} onChangeText={onNameChange} autoCapitalize="none" keyboardType="email-address" placeholder="Email or username" placeholderTextColor="#8e8a82" style={styles.loginInput} /><TextInput value={password} onChangeText={onPasswordChange} secureTextEntry placeholder="Password" placeholderTextColor="#8e8a82" style={styles.loginInput} />{error ? <Text style={styles.loginError}>{error}</Text> : null}<Pressable style={[styles.primaryButton, isLoading && styles.disabledButton]} onPress={onLogin} disabled={isLoading}><Text style={styles.primaryButtonText}>{isLoading ? 'Signing in...' : 'Sign in'}</Text></Pressable><Pressable style={styles.demoButton} onPress={onDemo}><Text style={styles.demoButtonText}>Continue demo mode</Text></Pressable><Text style={styles.loginHint}>Development account: customer@restomaster.io</Text></View></SafeAreaView>; }
function FoodCard({ item, onAdd, compact = false }: { item: FoodItem; onAdd: () => void; compact?: boolean }) { return <View style={[styles.foodCard, compact && styles.foodCardCompact]}><Image source={{ uri: item.imageUrl }} style={compact ? styles.foodImageCompact : styles.foodImage} /><View style={styles.foodDetails}><View style={styles.foodNameRow}><Text style={styles.foodName} numberOfLines={2}>{item.name}</Text><Text style={[styles.vegDot, { color: item.isVeg ? '#38c276' : '#e46351' }]}>●</Text></View><Text style={styles.foodDescription} numberOfLines={2}>{item.description}</Text><View style={styles.foodFooter}><Text style={styles.foodPrice}>₹{item.price}</Text><Text style={styles.rating}>★ {item.rating}</Text><Pressable style={styles.addButton} onPress={onAdd}><Text style={styles.addButtonText}>Add</Text></Pressable></View></View></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111615' },
  container: { flex: 1, backgroundColor: '#111615' },
  loginScreen: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 },
  loginTitle: { color: '#fff9ed', fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 12 },
  loginBody: { color: '#aab5aa', fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 26 },
  loginInput: { backgroundColor: '#1b2421', color: '#fff9ed', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 14, marginBottom: 12 },
  loginError: { color: '#ef8b78', fontSize: 12, marginBottom: 4 },
  demoButton: { alignItems: 'center', paddingVertical: 16 },
  demoButtonText: { color: '#d9a441', fontSize: 14, fontWeight: '700' },
  loginHint: { color: '#68766d', fontSize: 11, textAlign: 'center', marginTop: 28 },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#d9a441', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#fff9ed', fontSize: 21, fontWeight: '700', marginTop: 5 },
  supportButton: { borderWidth: 1, borderColor: '#2bd36b', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  supportText: { color: '#65df8e', fontSize: 12, fontWeight: '700' },
  content: { padding: 22, paddingBottom: 110 },
  flex: { flex: 1 },
  hero: { backgroundColor: '#24332d', borderRadius: 22, padding: 22, marginBottom: 28 },
  heroKicker: { color: '#d9a441', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  heroTitle: { color: '#fff9ed', fontSize: 29, lineHeight: 34, fontWeight: '800', marginTop: 12 },
  heroBody: { color: '#c3cbc0', fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 280 },
  primaryButton: { backgroundColor: '#d9a441', borderRadius: 12, paddingHorizontal: 17, paddingVertical: 13, alignItems: 'center', marginTop: 20 },
  primaryButtonText: { color: '#172019', fontWeight: '800', fontSize: 14 },
  disabledButton: { opacity: 0.55 },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionHeading: { color: '#fff9ed', fontSize: 20, fontWeight: '800' },
  sectionAction: { color: '#d9a441', fontSize: 13, fontWeight: '700' },
  horizontalList: { gap: 14, paddingBottom: 28 },
  infoRow: { flexDirection: 'row', gap: 12, backgroundColor: '#1b2421', borderRadius: 15, padding: 16 },
  infoIcon: { color: '#d9a441', fontSize: 26 },
  infoTitle: { color: '#fff9ed', fontSize: 14, fontWeight: '700' },
  infoBody: { color: '#aab5aa', fontSize: 12, marginTop: 5, maxWidth: 275 },
  menuTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 4 },
  pageTitle: { color: '#fff9ed', fontSize: 27, fontWeight: '800' },
  cartButton: { backgroundColor: '#d9a441', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 },
  cartButtonText: { color: '#172019', fontWeight: '800', fontSize: 13 },
  search: { backgroundColor: '#1b2421', color: '#fff9ed', borderRadius: 12, marginHorizontal: 22, marginTop: 18, paddingHorizontal: 15, paddingVertical: 13, fontSize: 14 },
  categoryList: { gap: 9, paddingHorizontal: 22, paddingVertical: 16 },
  category: { borderWidth: 1, borderColor: '#35433d', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  categoryActive: { backgroundColor: '#d9a441', borderColor: '#d9a441' },
  categoryText: { color: '#aab5aa', fontSize: 12, fontWeight: '700' },
  categoryTextActive: { color: '#172019' },
  menuList: { paddingHorizontal: 22, paddingBottom: 110, gap: 14 },
  foodCard: { backgroundColor: '#1b2421', borderRadius: 16, overflow: 'hidden', flexDirection: 'row', minHeight: 132 },
  foodCardCompact: { width: 255, flexDirection: 'column', minHeight: 0 },
  foodImage: { width: 118, height: 132 },
  foodImageCompact: { width: 255, height: 145 },
  foodDetails: { flex: 1, padding: 13 },
  foodNameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  foodName: { color: '#fff9ed', fontWeight: '800', fontSize: 14, lineHeight: 18, flex: 1 },
  vegDot: { fontSize: 10 },
  foodDescription: { color: '#99a59b', fontSize: 11, lineHeight: 16, marginTop: 5 },
  foodFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 9 },
  foodPrice: { color: '#fff9ed', fontWeight: '800', fontSize: 15 },
  rating: { color: '#d9a441', fontSize: 11, fontWeight: '700' },
  addButton: { backgroundColor: '#d9a441', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 'auto' },
  addButtonText: { color: '#172019', fontSize: 11, fontWeight: '800' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, backgroundColor: '#18201d', borderTopWidth: 1, borderTopColor: '#2b3832', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 8 },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 60, height: 54 },
  navLabel: { color: '#77847a', fontSize: 12, fontWeight: '700' },
  navLabelActive: { color: '#d9a441' },
  badge: { position: 'absolute', top: 3, right: 8, backgroundColor: '#e46351', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { color: '#aab5aa', fontSize: 16 },
  orderCard: { backgroundColor: '#1b2421', borderRadius: 15, padding: 17, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderLabel: { color: '#8e9c91', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  orderNumber: { color: '#fff9ed', fontWeight: '800', fontSize: 16, marginTop: 6 },
  statusPill: { backgroundColor: '#d9a441', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: '#172019', fontSize: 11, fontWeight: '800' },
  profileCard: { backgroundColor: '#24332d', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 20, marginBottom: 18 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#d9a441', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#172019', fontSize: 22, fontWeight: '800' },
  profileName: { color: '#fff9ed', fontSize: 17, fontWeight: '800' },
  profileEmail: { color: '#aab5aa', fontSize: 12, marginTop: 4 },
  profileRow: { borderBottomWidth: 1, borderBottomColor: '#2b3832', paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between' },
  profileRowText: { color: '#e1e6db', fontSize: 15, fontWeight: '600' },
  chevron: { color: '#d9a441', fontSize: 23 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  cartSheet: { backgroundColor: '#18201d', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, minHeight: 330, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  close: { color: '#d9a441', fontWeight: '700' },
  cartRow: { borderBottomWidth: 1, borderBottomColor: '#2b3832', paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartInfo: { flex: 1, paddingRight: 10 },
  cartName: { color: '#fff9ed', fontSize: 14, fontWeight: '700' },
  cartPrice: { color: '#aab5aa', fontSize: 12, marginTop: 4 },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityButton: { color: '#d9a441', fontSize: 24 },
  quantityValue: { color: '#fff9ed', fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  totalLabel: { color: '#aab5aa', fontSize: 15 },
  totalValue: { color: '#fff9ed', fontSize: 20, fontWeight: '800' },
});
