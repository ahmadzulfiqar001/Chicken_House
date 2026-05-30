# Assignment 1 - Actual Atlas Relationship Diagram

```mermaid
graph TD
    CATEGORIES[categories]
    MENUITEMS[menuitems]
    INGREDIENTS[ingredients]
    RECIPES[recipes]
    ORDERS[orders]
    SETTINGS[restaurantsettings]
    USERS[users]

    CATEGORIES -->|_id -> category| MENUITEMS
    MENUITEMS -->|_id -> menuItem| RECIPES
    INGREDIENTS -->|_id -> ingredients[].ingredient| RECIPES
    MENUITEMS -->|used inside order details| ORDERS
```

## Short Note

- `categories`, `menuitems`, `ingredients`, and `recipes` form the core food and inventory design.
- `orders` is the transactional collection for customer purchases.
- `restaurantsettings` stores business-wide configuration.
- `users` stores admin or system users.
