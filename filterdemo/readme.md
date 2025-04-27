
# Request

```
query{
  v1:searchMovies {
    id
    director
    title
    year
  },

  v2:searchMovies(filter: {
    and: [
      { director: { eq: "Christopher Nolan" } }
      { year: { gt: 2005 } }
    ]
  }) {
    title
    year
  },
  v3:searchMovies(filter: {
    or: [
      { title: { contains: "The" } }
      { director: { eq: "Quentin Tarantino" } }
    ]
  }) {
    title
    director
  },
v4:searchMovies(filter: {  #Nested
    or: [
      { director: { contains: "Nolan" } }
      {
        and: [
          { year: { gt: 2010 } }
          { title: { contains: "Dark" } }
        ]
      }
    ]
  }) {
    title
    year,
    director
  },
v5:searchMovies(filter: { #in clause
  or:[{
    year: { 
      in: [2010, 2012, 2014] 
    }
  },
   {
    director:  {
       in:["Christopher Nolan","Quentin Tarantino"]
    }
   }
  ]
  
  }
  ) {
    title
    year,
    director
  }

}

```