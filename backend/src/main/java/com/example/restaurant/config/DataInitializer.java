package com.example.restaurant.config;

import com.example.restaurant.entity.*;
import com.example.restaurant.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final OutletRepository outletRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FloorRepository floorRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final InventoryUnitRepository unitRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final RecipeRepository recipeRepository;

    public DataInitializer(
            OutletRepository outletRepository,
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FloorRepository floorRepository,
            RestaurantTableRepository tableRepository,
            MenuCategoryRepository categoryRepository,
            MenuItemRepository menuItemRepository,
            ModifierGroupRepository modifierGroupRepository,
            InventoryUnitRepository unitRepository,
            InventoryItemRepository inventoryItemRepository,
            RecipeRepository recipeRepository) {
        this.outletRepository = outletRepository;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.floorRepository = floorRepository;
        this.tableRepository = tableRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.modifierGroupRepository = modifierGroupRepository;
        this.unitRepository = unitRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.recipeRepository = recipeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed Sample Outlet
        Outlet defaultOutlet = outletRepository.findByCode("OUT-001").orElseGet(() -> {
            Outlet outlet = new Outlet(UUID.randomUUID().toString(), "Downtown Flagship Outlet", "OUT-001");
            outlet.setAddress("123 Gourmet Boulevard, Food District");
            outlet.setPhone("+1-555-0199");
            outlet.setEmail("downtown@restomaster.io");
            outlet.setTaxNumber("TAX-US-892110");
            outlet.setOpeningTime("08:00");
            outlet.setClosingTime("23:00");
            return outletRepository.save(outlet);
        });

        // 2. Seed Permissions
        Map<String, String[]> permissionsByCategory = new LinkedHashMap<>();
        permissionsByCategory.put("USER", new String[]{"USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE"});
        permissionsByCategory.put("ROLE", new String[]{"ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE"});
        permissionsByCategory.put("OUTLET", new String[]{"OUTLET_VIEW", "OUTLET_CREATE", "OUTLET_UPDATE"});
        permissionsByCategory.put("MENU", new String[]{"MENU_VIEW", "MENU_CREATE", "MENU_UPDATE", "MENU_DELETE"});
        permissionsByCategory.put("ORDER", new String[]{"ORDER_VIEW", "ORDER_CREATE", "ORDER_UPDATE", "ORDER_CANCEL"});
        permissionsByCategory.put("KITCHEN", new String[]{"KITCHEN_VIEW", "KITCHEN_UPDATE"});
        permissionsByCategory.put("BILL", new String[]{"BILL_VIEW", "BILL_CREATE"});
        permissionsByCategory.put("PAYMENT", new String[]{"PAYMENT_CREATE", "PAYMENT_REFUND"});
        permissionsByCategory.put("INVENTORY", new String[]{"INVENTORY_VIEW", "INVENTORY_UPDATE"});
        permissionsByCategory.put("REPORT", new String[]{"REPORT_VIEW", "REPORT_EXPORT"});
        permissionsByCategory.put("SETTINGS", new String[]{"SETTINGS_VIEW", "SETTINGS_UPDATE"});

        Map<String, Permission> permMap = new HashMap<>();
        permissionsByCategory.forEach((category, perms) -> {
            for (String permName : perms) {
                Permission perm = permissionRepository.findByName(permName).orElseGet(() ->
                        permissionRepository.save(new Permission(
                                UUID.randomUUID().toString(),
                                permName,
                                "Allows " + permName.replace('_', ' ').toLowerCase(),
                                category
                        ))
                );
                permMap.put(permName, perm);
            }
        });

        // 3. Seed Roles
        Role adminRole = getOrCreateRole("ADMIN", "System Administrator with full privileges", new HashSet<>(permMap.values()));
        
        Set<Permission> managerPerms = new HashSet<>();
        permMap.forEach((name, p) -> {
            if (!name.startsWith("ROLE_") && !name.equals("USER_DELETE")) {
                managerPerms.add(p);
            }
        });
        Role managerRole = getOrCreateRole("MANAGER", "Restaurant General Manager", managerPerms);

        Set<Permission> cashierPerms = new HashSet<>();
        cashierPerms.add(permMap.get("ORDER_VIEW"));
        cashierPerms.add(permMap.get("ORDER_CREATE"));
        cashierPerms.add(permMap.get("ORDER_UPDATE"));
        cashierPerms.add(permMap.get("ORDER_CANCEL"));
        cashierPerms.add(permMap.get("BILL_VIEW"));
        cashierPerms.add(permMap.get("BILL_CREATE"));
        cashierPerms.add(permMap.get("PAYMENT_CREATE"));
        cashierPerms.add(permMap.get("MENU_VIEW"));
        cashierPerms.add(permMap.get("OUTLET_VIEW"));
        Role cashierRole = getOrCreateRole("CASHIER", "Front-of-house cashier and order taker", cashierPerms);

        Set<Permission> waiterPerms = new HashSet<>();
        waiterPerms.add(permMap.get("ORDER_VIEW"));
        waiterPerms.add(permMap.get("ORDER_CREATE"));
        waiterPerms.add(permMap.get("ORDER_UPDATE"));
        waiterPerms.add(permMap.get("MENU_VIEW"));
        waiterPerms.add(permMap.get("OUTLET_VIEW"));
        Role waiterRole = getOrCreateRole("WAITER", "Waitstaff for dining table management", waiterPerms);

        Set<Permission> kitchenPerms = new HashSet<>();
        kitchenPerms.add(permMap.get("KITCHEN_VIEW"));
        kitchenPerms.add(permMap.get("KITCHEN_UPDATE"));
        kitchenPerms.add(permMap.get("ORDER_VIEW"));
        Role kitchenRole = getOrCreateRole("KITCHEN", "Kitchen station staff and chefs", kitchenPerms);

        Set<Permission> inventoryPerms = new HashSet<>();
        inventoryPerms.add(permMap.get("INVENTORY_VIEW"));
        inventoryPerms.add(permMap.get("INVENTORY_UPDATE"));
        inventoryPerms.add(permMap.get("REPORT_VIEW"));
        Role inventoryRole = getOrCreateRole("INVENTORY", "Stock control and inventory manager", inventoryPerms);

        // 4. Seed Users
        createUserIfAbsent("admin", "admin@restomaster.io", "Admin@123", "System Administrator", "+1-555-0100", defaultOutlet, Set.of(adminRole), true);
        createUserIfAbsent("manager", "manager@restomaster.io", "Manager@123", "Alice Manager", "+1-555-0101", defaultOutlet, Set.of(managerRole), true);
        createUserIfAbsent("cashier", "cashier@restomaster.io", "Cashier@123", "John Cashier", "+1-555-0102", defaultOutlet, Set.of(cashierRole), true);
        createUserIfAbsent("waiter", "waiter@restomaster.io", "Waiter@123", "Bob Waiter", "+1-555-0103", defaultOutlet, Set.of(waiterRole), true);
        createUserIfAbsent("kitchen", "kitchen@restomaster.io", "Kitchen@123", "Chef Mario", "+1-555-0104", defaultOutlet, Set.of(kitchenRole), true);
        createUserIfAbsent("inventory", "inventory@restomaster.io", "Inventory@123", "Dave Inventory", "+1-555-0105", defaultOutlet, Set.of(inventoryRole), true);
        createUserIfAbsent("inactive_user", "inactive@restomaster.io", "Inactive@123", "Deactivated Staff", "+1-555-0199", defaultOutlet, Set.of(cashierRole), false);

        // 5. Seed Floors and Tables for Default Outlet
        Floor groundFloor = floorRepository.findByOutletIdOrderByFloorNumberAsc(defaultOutlet.getId())
                .stream()
                .filter(f -> f.getFloorNumber() == 1)
                .findFirst()
                .orElseGet(() -> {
                    Floor floor = new Floor(UUID.randomUUID().toString(), defaultOutlet, "Ground Floor - Main Dining", 1);
                    return floorRepository.save(floor);
                });

        Floor terraceFloor = floorRepository.findByOutletIdOrderByFloorNumberAsc(defaultOutlet.getId())
                .stream()
                .filter(f -> f.getFloorNumber() == 2)
                .findFirst()
                .orElseGet(() -> {
                    Floor floor = new Floor(UUID.randomUUID().toString(), defaultOutlet, "First Floor - Terrace Lounge", 2);
                    return floorRepository.save(floor);
                });

        // Seed Ground Floor Tables
        createTableIfAbsent(groundFloor, "T-01", 2, TableShape.SQUARE, 60, 60, TableStatus.AVAILABLE);
        createTableIfAbsent(groundFloor, "T-02", 4, TableShape.SQUARE, 220, 60, TableStatus.OCCUPIED);
        createTableIfAbsent(groundFloor, "T-03", 4, TableShape.SQUARE, 380, 60, TableStatus.AVAILABLE);
        createTableIfAbsent(groundFloor, "T-04", 6, TableShape.RECTANGLE, 60, 220, TableStatus.RESERVED);
        createTableIfAbsent(groundFloor, "T-05", 8, TableShape.RECTANGLE, 260, 220, TableStatus.BILLING);
        createTableIfAbsent(groundFloor, "T-06", 2, TableShape.ROUND, 480, 220, TableStatus.AVAILABLE);

        // Seed Terrace Lounge Tables
        createTableIfAbsent(terraceFloor, "TR-01", 4, TableShape.ROUND, 80, 60, TableStatus.AVAILABLE);
        createTableIfAbsent(terraceFloor, "TR-02", 4, TableShape.ROUND, 240, 60, TableStatus.AVAILABLE);
        createTableIfAbsent(terraceFloor, "TR-03", 6, TableShape.RECTANGLE, 400, 60, TableStatus.OCCUPIED);
        createTableIfAbsent(terraceFloor, "TR-04", 2, TableShape.SQUARE, 80, 220, TableStatus.RESERVED);

        // 6. Seed Inventory Units
        InventoryUnit kg = getOrCreateUnit("Kilogram", "kg");
        InventoryUnit g = getOrCreateUnit("Gram", "g");
        InventoryUnit l = getOrCreateUnit("Liter", "L");
        InventoryUnit ml = getOrCreateUnit("Milliliter", "ml");
        InventoryUnit pcs = getOrCreateUnit("Piece", "pcs");

        // 7. Seed Raw Inventory Items for defaultOutlet
        InventoryItem dough = getOrCreateInventoryItem(defaultOutlet, "Pizza Dough (Ball)", "ING-001", pcs, new BigDecimal("0.75"), new BigDecimal("100.000"));
        InventoryItem tomatoSauce = getOrCreateInventoryItem(defaultOutlet, "San Marzano Tomato Sauce", "ING-002", kg, new BigDecimal("4.50"), new BigDecimal("50.000"));
        InventoryItem mozzarella = getOrCreateInventoryItem(defaultOutlet, "Fresh Mozzarella Cheese", "ING-003", kg, new BigDecimal("8.00"), new BigDecimal("40.000"));
        InventoryItem pasta = getOrCreateInventoryItem(defaultOutlet, "Artisan Penne Pasta", "ING-004", kg, new BigDecimal("3.00"), new BigDecimal("60.000"));
        InventoryItem cream = getOrCreateInventoryItem(defaultOutlet, "Heavy Cream", "ING-005", l, new BigDecimal("5.00"), new BigDecimal("30.000"));
        InventoryItem parmesan = getOrCreateInventoryItem(defaultOutlet, "Parmigiano Reggiano", "ING-006", kg, new BigDecimal("16.00"), new BigDecimal("20.000"));
        InventoryItem coffeeBeans = getOrCreateInventoryItem(defaultOutlet, "Espresso Roast Beans", "ING-007", kg, new BigDecimal("18.00"), new BigDecimal("25.000"));
        InventoryItem wholeMilk = getOrCreateInventoryItem(defaultOutlet, "Whole Milk", "ING-008", l, new BigDecimal("1.80"), new BigDecimal("80.000"));

        // 8. Seed Modifier Groups
        ModifierGroup sizeGroup = getOrCreateModifierGroup(defaultOutlet, "Size Selection", 1, 1);
        getOrCreateModifier(sizeGroup, "Regular (10\")", BigDecimal.ZERO);
        getOrCreateModifier(sizeGroup, "Large (14\")", new BigDecimal("4.00"));

        ModifierGroup crustGroup = getOrCreateModifierGroup(defaultOutlet, "Crust Option", 1, 1);
        getOrCreateModifier(crustGroup, "Classic Hand-Tossed", BigDecimal.ZERO);
        getOrCreateModifier(crustGroup, "Thin & Crispy", BigDecimal.ZERO);
        getOrCreateModifier(crustGroup, "Cheese Stuffed Crust", new BigDecimal("2.50"));

        ModifierGroup addonsGroup = getOrCreateModifierGroup(defaultOutlet, "Extra Add-ons", 0, 5);
        getOrCreateModifier(addonsGroup, "Extra Mozzarella", new BigDecimal("1.50"));
        getOrCreateModifier(addonsGroup, "Truffle Oil Drizzle", new BigDecimal("2.00"));
        getOrCreateModifier(addonsGroup, "Fresh Basil & Oregano", new BigDecimal("0.50"));

        // 9. Seed Categories
        MenuCategory startersCat = getOrCreateCategory(defaultOutlet, "Starters & Appetizers", "Crispy delights and shareable opening bites", 1);
        MenuCategory pizzaCat = getOrCreateCategory(defaultOutlet, "Wood-Fired Pizzas", "Authentic Neapolitan sourdough pizzas baked at 900°F", 2);
        MenuCategory pastaCat = getOrCreateCategory(defaultOutlet, "Artisan Pastas", "Handcrafted Italian pastas tossed in signature sauces", 3);
        MenuCategory beverageCat = getOrCreateCategory(defaultOutlet, "Beverages & Coffee", "Handcrafted espresso, mocktails, and fresh coolers", 4);
        MenuCategory dessertCat = getOrCreateCategory(defaultOutlet, "Artisan Desserts", "Sweet endings and decadent treats", 5);

        // 10. Seed Menu Items
        MenuItem margherita = getOrCreateMenuItem(pizzaCat, "Margherita D.O.P Pizza", "Crushed San Marzano tomatoes, fresh mozzarella, basil, EVOO", new BigDecimal("14.50"), new BigDecimal("3.25"), 15, Set.of(sizeGroup, crustGroup, addonsGroup));
        MenuItem pepperoni = getOrCreateMenuItem(pizzaCat, "Spicy Pepperoni Pizza", "Smoked pepperoni slices, hot honey drizzle, mozzarella", new BigDecimal("16.50"), new BigDecimal("4.10"), 15, Set.of(sizeGroup, crustGroup, addonsGroup));
        MenuItem alfredo = getOrCreateMenuItem(pastaCat, "Creamy Fettuccine Alfredo", "Rich garlic parmesan cream sauce, cracked pepper, parsley", new BigDecimal("13.00"), new BigDecimal("2.90"), 12, Set.of(addonsGroup));
        MenuItem bruschetta = getOrCreateMenuItem(startersCat, "Classic Tomato Bruschetta", "Toasted sourdough, heirloom tomatoes, garlic, aged balsamic", new BigDecimal("8.50"), new BigDecimal("1.80"), 8, Set.of());
        MenuItem cappuccino = getOrCreateMenuItem(beverageCat, "Artisan Cappuccino", "Double espresso shot with velvety micro-foam milk", new BigDecimal("4.50"), new BigDecimal("0.65"), 5, Set.of());
        MenuItem tiramisu = getOrCreateMenuItem(dessertCat, "Traditional Tiramisu", "Savoiardi ladyfingers soaked in espresso with mascarpone", new BigDecimal("7.50"), new BigDecimal("1.95"), 5, Set.of());

        // 11. Seed Recipe BOM for Margherita Pizza
        createRecipeIfAbsent(margherita, "Stretch dough ball to 12 inches. Spread 80g tomato sauce evenly leaving 1 inch rim. Top with 150g fresh mozzarella. Bake in wood-fired oven at 850°F for 90 seconds. Garnish with fresh basil and EVOO.", List.of(
                new RecipeItemInit(dough, new BigDecimal("1.000")),
                new RecipeItemInit(tomatoSauce, new BigDecimal("0.080")),
                new RecipeItemInit(mozzarella, new BigDecimal("0.150"))
        ));

        // Seed Recipe BOM for Fettuccine Alfredo
        createRecipeIfAbsent(alfredo, "Boil pasta for 9 minutes until al dente. In a separate pan, warm cream and butter, whisk in freshly grated parmesan until silky. Toss pasta in sauce and season.", List.of(
                new RecipeItemInit(pasta, new BigDecimal("0.200")),
                new RecipeItemInit(cream, new BigDecimal("0.120")),
                new RecipeItemInit(parmesan, new BigDecimal("0.060"))
        ));
    }

    private void createTableIfAbsent(Floor floor, String tableNumber, int capacity, TableShape shape, int posX, int posY, TableStatus status) {
        if (!tableRepository.existsByFloorIdAndTableNumberIgnoreCase(floor.getId(), tableNumber)) {
            RestaurantTable table = new RestaurantTable(
                    UUID.randomUUID().toString(),
                    floor,
                    tableNumber,
                    capacity,
                    shape,
                    posX,
                    posY
            );
            table.setStatus(status);
            tableRepository.save(table);
        }
    }

    private Role getOrCreateRole(String name, String description, Set<Permission> permissions) {
        return roleRepository.findByName(name).map(existing -> {
            existing.setPermissions(permissions);
            return roleRepository.save(existing);
        }).orElseGet(() -> {
            Role role = new Role(UUID.randomUUID().toString(), name, description);
            role.setPermissions(permissions);
            return roleRepository.save(role);
        });
    }

    private void createUserIfAbsent(
            String username,
            String email,
            String rawPassword,
            String fullName,
            String phone,
            Outlet outlet,
            Set<Role> roles,
            boolean active) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User(
                    UUID.randomUUID().toString(),
                    username,
                    email,
                    passwordEncoder.encode(rawPassword),
                    fullName
            );
            user.setPhone(phone);
            user.setOutlet(outlet);
            user.setRoles(roles);
            user.setActive(active);
            userRepository.save(user);
        }
    }

    private InventoryUnit getOrCreateUnit(String name, String symbol) {
        return unitRepository.findBySymbolIgnoreCase(symbol).orElseGet(() ->
                unitRepository.save(new InventoryUnit(UUID.randomUUID().toString(), name, symbol))
        );
    }

    private InventoryItem getOrCreateInventoryItem(Outlet outlet, String name, String sku, InventoryUnit unit, BigDecimal unitCost, BigDecimal currentStock) {
        return inventoryItemRepository.findByOutletIdAndSku(outlet.getId(), sku).orElseGet(() -> {
            InventoryItem item = new InventoryItem(UUID.randomUUID().toString(), outlet, name, sku, unit, unitCost);
            item.setCurrentStock(currentStock);
            return inventoryItemRepository.save(item);
        });
    }

    private ModifierGroup getOrCreateModifierGroup(Outlet outlet, String name, int minSel, int maxSel) {
        return modifierGroupRepository.findByOutletIdOrderByCreatedAtAsc(outlet.getId()).stream()
                .filter(mg -> mg.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> modifierGroupRepository.save(new ModifierGroup(UUID.randomUUID().toString(), outlet, name, minSel, maxSel)));
    }

    private void getOrCreateModifier(ModifierGroup group, String name, BigDecimal price) {
        boolean exists = group.getModifiers().stream().anyMatch(m -> m.getName().equalsIgnoreCase(name));
        if (!exists) {
            Modifier mod = new Modifier(UUID.randomUUID().toString(), group, name, price);
            group.getModifiers().add(mod);
            modifierGroupRepository.save(group);
        }
    }

    private MenuCategory getOrCreateCategory(Outlet outlet, String name, String description, int displayOrder) {
        return categoryRepository.findByOutletIdOrderByDisplayOrderAsc(outlet.getId()).stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(new MenuCategory(UUID.randomUUID().toString(), outlet, name, description, displayOrder)));
    }

    private MenuItem getOrCreateMenuItem(MenuCategory category, String name, String description, BigDecimal price, BigDecimal costPrice, int prepTime, Set<ModifierGroup> modGroups) {
        return menuItemRepository.findByCategoryIdOrderByPriceAsc(category.getId()).stream()
                .filter(m -> m.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    MenuItem item = new MenuItem(UUID.randomUUID().toString(), category, name, price);
                    item.setDescription(description);
                    item.setCostPrice(costPrice);
                    item.setPrepTimeMinutes(prepTime);
                    item.setModifierGroups(new HashSet<>(modGroups));
                    return menuItemRepository.save(item);
                });
    }

    private static class RecipeItemInit {
        InventoryItem item;
        BigDecimal quantity;
        RecipeItemInit(InventoryItem item, BigDecimal quantity) {
            this.item = item;
            this.quantity = quantity;
        }
    }

    private void createRecipeIfAbsent(MenuItem menuItem, String instructions, List<RecipeItemInit> ingredients) {
        if (!recipeRepository.existsByMenuItemId(menuItem.getId())) {
            Recipe recipe = new Recipe(UUID.randomUUID().toString(), menuItem, instructions);
            for (RecipeItemInit ing : ingredients) {
                RecipeItem rItem = new RecipeItem(UUID.randomUUID().toString(), recipe, ing.item, ing.quantity);
                recipe.getRecipeItems().add(rItem);
            }
            recipeRepository.save(recipe);
        }
    }
}
