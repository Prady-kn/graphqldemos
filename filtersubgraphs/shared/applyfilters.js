// shared/filters.js
function applyFilters(item, filter) {
  if (!filter) return true;
  
  // Handle logical operators first
  if (filter.AND) {
    return filter.AND.every(subFilter => applyFilters(item, subFilter));
  }
  
  if (filter.OR) {
    return filter.OR.some(subFilter => applyFilters(item, subFilter));
  }

  return Object.entries(filter).every(([field, conditions]) => {
    const value = item[field];
    
    // Handle nested object filters
    // if (typeof conditions === 'object' && !Array.isArray(conditions)) {
    //   return applyFilters(value, conditions);
    // }

    // Handle direct value comparison
    // if (typeof conditions !== 'object' || Array.isArray(conditions)) {
    //   return value === conditions;
    // }

    // Handle operator-based filters
    return Object.entries(conditions).every(([operator, compareValue]) => {
      switch(operator) {
        case 'eq': return value === compareValue;
        case 'ne': return value !== compareValue;
        case 'gt': return value > compareValue;
        case 'gte': return value >= compareValue;
        case 'lt': return value < compareValue;
        case 'lte': return value <= compareValue;
        case 'in': return compareValue.includes(value);
        case 'contains': 
          return typeof value === 'string' && value.includes(compareValue);
        case 'startsWith': 
          return typeof value === 'string' && value.startsWith(compareValue);
        case 'endsWith': 
          return typeof value === 'string' && value.endsWith(compareValue);
        case 'between':
          return value >= compareValue.from && value <= compareValue.to;
        case 'has':
          return Array.isArray(value) && value.includes(compareValue);
        case 'hasAll':
          return Array.isArray(value) && 
                 compareValue.every(v => value.includes(v));
        case 'hasAny':
          return Array.isArray(value) && 
                 compareValue.some(v => value.includes(v));
        default:
          throw new Error(`Unsupported filter operator: ${operator}`);
      }
    });
  });
}

module.exports.applyFilters = applyFilters;
