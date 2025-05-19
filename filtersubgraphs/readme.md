
# Sample request

```
query Movie($movieId: ID!) {
  movie(id: $movieId) {
    genre
    id
    rating
    title
    year
    reviews ( filter:  {
       comment:  {
         contains: "!"
       }
    }) {
      comment   
      movieId   
    }
  }
}

```