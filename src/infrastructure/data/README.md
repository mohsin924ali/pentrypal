# Grocery Items Data

This directory contains the grocery items data used by the PentryPal
application.

## Files

### `groceryItems.json`

Contains all grocery items organized by categories with the following structure:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-09-14T15:00:14.495Z",
  "categories": [
    {
      "id": "fruits",
      "name": "Fruits & Vegetables",
      "icon": "🍎",
      "items": [
        {
          "id": "apple",
          "name": "Apple",
          "icon": "🍎",
          "category": "fruits",
          "defaultUnit": "pieces",
          "commonUnits": ["pieces", "lbs", "kg", "packs"]
        }
      ]
    }
  ]
}
```

## Data Structure

### Category Object

- `id`: Unique identifier for the category
- `name`: Display name for the category
- `icon`: Emoji icon representing the category
- `items`: Array of grocery items in this category

### Grocery Item Object

- `id`: Unique identifier for the item
- `name`: Display name for the item
- `icon`: Emoji icon representing the item
- `category`: Category ID this item belongs to
- `defaultUnit`: Default unit of measurement
- `commonUnits`: Array of common units for this item

## Statistics

- **Total Categories**: 11
- **Total Items**: 407
- **Version**: 1.0.0

## Categories

1. **Fruits & Vegetables** (37 items) - 🍎
2. **Vegetables** (45 items) - 🥕
3. **Meat & Seafood** (27 items) - 🥩
4. **Dairy & Alternatives** (Various items) - 🥛
5. **Grains & Bakery** (41 items) - 🍞
6. **Beans & Legumes** (18 items) - 🫘
7. **Spices & Herbs** (20 items) - 🌶️
8. **Canned & Condiments** (Various items) - 🥫
9. **Pantry Staples** (Various items) - 🏺
10. **Beverages** (Various items) - 🥤
11. **Other** (Various items) - 📦

## Maintenance

To update the grocery items:

1. Edit the `groceryItems.json` file directly
2. Update the `version` and `lastUpdated` fields
3. Ensure all items have unique IDs
4. Test the application to verify changes work correctly

## Data Validation

The grocery service includes built-in validation that checks for:

- Duplicate item IDs
- Empty categories
- Missing required fields
- Data integrity issues
