| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.jwtpizza-jgray10.click                                                   |
| Classification | Identification and Authentication Failures                                     |
| Severity       | 2                                                                              |
| Description    | A user is able to sign in to an account when a password is not included in the request.                |
| Corrections    | Set a check for password to not be null                                        |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.jwtpizza-jgray10.click                                                   |
| Classification | Mishandled Exceptions                                                          |
| Severity       | 4                                                                              |
| Description    | When a parameter is missing from an order, no exception is handled.            |
| Corrections    | Return request when parameters are missing                                     |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.jwtpizza-jgray10.click                                                   |
| Classification | Broken Access Control                                                          |
| Severity       | 2                                                                              |
| Description    | Any user can delete other users                                                |
| Corrections    | Set a check for admin priveleges in user delete                                |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.jwtpizza-jgray10.click                                                   |
| Classification | Broken Access Control                                                          |
| Severity       | 2                                                                              |
| Description    | There is no auth check for deleting a franchise                                |
| Corrections    | Set a check auth check within the method                                       |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.jwtpizza-jgray10.click                                                   |
| Classification | Identification and Authentication Failures                                     |
| Severity       | 1                                                                              |
| Description    | Multiple users can be created with the same email                              |
| Corrections    | Set a check for duplicate emails                                               |