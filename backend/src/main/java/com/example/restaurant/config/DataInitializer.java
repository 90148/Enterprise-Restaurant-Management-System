package com.example.restaurant.config;

import com.example.restaurant.entity.*;
import com.example.restaurant.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

    public DataInitializer(
            OutletRepository outletRepository,
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FloorRepository floorRepository,
            RestaurantTableRepository tableRepository) {
        this.outletRepository = outletRepository;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.floorRepository = floorRepository;
        this.tableRepository = tableRepository;
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
        cashierPerms.add(permMap.get("BILL_VIEW"));
        cashierPerms.add(permMap.get("BILL_CREATE"));
        cashierPerms.add(permMap.get("PAYMENT_CREATE"));
        cashierPerms.add(permMap.get("MENU_VIEW"));
        cashierPerms.add(permMap.get("OUTLET_VIEW"));
        Role cashierRole = getOrCreateRole("CASHIER", "Front-of-house cashier and order taker", cashierPerms);

        Set<Permission> waiterPerms = new HashSet<>();
        waiterPerms.add(permMap.get("ORDER_VIEW"));
        waiterPerms.add(permMap.get("ORDER_CREATE"));
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
}
