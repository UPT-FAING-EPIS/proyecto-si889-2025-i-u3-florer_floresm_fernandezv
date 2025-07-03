using DataDicGen.Application.Interfaces.Services;
using DataDicGen.WebAPI.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Text.Json;

namespace DataDictGen.Tests;

public class LoginTests
{
    [Fact]
    public void AuthController_Login_DebeRetornarOk_CuandoCredencialesSonCorrectas()
    {
        // Arrange - Preparación
        var mockAuthService = new Mock<IAuthService>();
        mockAuthService.Setup(service => service.ValidateUser("admin", "admin123"))
            .Returns(true);

        var controller = new AuthController(mockAuthService.Object);
        var request = new LoginRequest
        {
            Username = "admin",
            Password = "admin123"
        };

        // Act - Ejecución
        var result = controller.Login(request);

        // Assert - Verificación
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        
        // Convertir el resultado a JSON y luego deserializarlo para poder acceder a sus propiedades
        var jsonResult = JsonSerializer.Serialize(okResult.Value);
        var resultObj = JsonSerializer.Deserialize<Dictionary<string, string>>(jsonResult);
        
        Assert.NotNull(resultObj);
        Assert.True(resultObj.ContainsKey("message"));
        Assert.Equal("Login exitoso", resultObj["message"]);
    }
}