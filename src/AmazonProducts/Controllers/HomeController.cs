using Microsoft.AspNetCore.Mvc;

namespace AmazonProducts.Controllers
{
    /// <summary>
    /// Entry point controller for application.
    /// </summary>
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
