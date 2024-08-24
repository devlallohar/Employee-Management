## Deployment

1. Set up your MongoDB connection string and JWT secret as environment variables.
2. Deploy using `serverless deploy`.

## Testing

1. **Generate Token**: `POST /token`
2. **Create Employee**: `POST /employees` with token
3. **Read Employee**: `GET /employees/{id}` with token
4. **List Employees**: `GET /employees` with token
5. **Update Employee**: `PUT /employees/{id}` with token
6. **Delete Employee**: `DELETE /employees/{id}` with token
