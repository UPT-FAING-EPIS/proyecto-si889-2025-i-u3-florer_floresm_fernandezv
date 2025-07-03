# Use the official .NET 8.0 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["DictApp/DataDictGen.sln", "DictApp/"]
COPY ["DictApp/DataDicGen.WebAPI/DataDicGen.WebAPI.csproj", "DictApp/DataDicGen.WebAPI/"]
COPY ["DictApp/DataDicGen.Application/DataDicGen.Application.csproj", "DictApp/DataDicGen.Application/"]
COPY ["DictApp/DataDicGen.Domain/DataDicGen.Domain.csproj", "DictApp/DataDicGen.Domain/"]
COPY ["DictApp/DataDicGen.Infrastructure/DataDicGen.Infrastructure.csproj", "DictApp/DataDicGen.Infrastructure/"]
COPY ["DictApp/DataDictGen.Tests/DataDictGen.Tests.csproj", "DictApp/DataDictGen.Tests/"]

# Restore dependencies
RUN dotnet restore "DictApp/DataDictGen.sln"

# Copy the entire source code
COPY . .

# Build and publish the application
WORKDIR "/src/DictApp/DataDicGen.WebAPI"
RUN dotnet build "DataDicGen.WebAPI.csproj" -c Release -o /app/build
RUN dotnet publish "DataDicGen.WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 8.0 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create a non-root user
RUN adduser --disabled-password --gecos '' dotnetuser && chown -R dotnetuser /app
USER dotnetuser

# Copy the published application
COPY --from=build /app/publish .

# Expose the port (adjust if your app uses a different port)
EXPOSE 8080

# Configure the entry point
ENTRYPOINT ["dotnet", "DataDicGen.WebAPI.dll"]
