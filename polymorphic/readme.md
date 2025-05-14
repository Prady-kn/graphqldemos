

# Sample input
```
query Members {
 v1: members {
    name,
    age
    ... on Employee {
      employeeNumber
    }
    ... on Inspector {
      designation
    }
  }
  v2: unionmembers{

     ... on Employee {
      name, age
      employeeNumber
    }
    ... on Inspector {
      name, age
      designation
    } 
  }
}


```

# 1. Use interface to implement polymorphic / rleated relationships

```
interface Person {
  name: String!
  age: Int!
}

type Employee implements Person {
  name: String!
  age: Int!
  employeeNumber: String!
}

type Inspector implements Person {
  name: String!
  age: Int!
  designation: String!
}

type Query {
  members: [Person!]!
}

```

## Query syntax

```

query GetMembers {
  members {
    name
    age
    # Type-specific fields
    ... on Employee {
      employeeNumber
    }
    ... on Inspector {
      designation
    }
  }
}


```

# 2. Use Union for unrelated entities 

```

union Member = Employee | Inspector

type Query {
  members: [Member!]!
}


```

## Query syntax

```

query GetMembers {
  members {
    ... on Employee {
      name
      age
      employeeNumber
    }
    ... on Inspector {
      name
      age
      designation
    }
  }
}


```