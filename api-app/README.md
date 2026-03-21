# api-app

- Install EF Core CLI:
```sh
dotnet tool install --global dotnet-ef
```

- Create Migration:
```sh
dotnet ef migrations add <MigrationName> --project Infrastructure --startup-project Feature
```

- Apply Migration:
```sh
dotnet ef database update --project Infrastructure --startup-project Feature
```