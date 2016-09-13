using AmazonProducts.Utilities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AmazonProducts.Controllers
{
    [Route("api/[controller]")]
    public class CurrencyController : Controller
    {
        [HttpGet("[action]")]
        public JsonResult List()
        {
            var enumList = Enum.GetValues(typeof(Currency))
               .Cast<Currency>();

            var data = new List<object>();
            foreach (var enumItem in enumList)
            {
                data.Add(new { name = enumItem.ToString(), value = enumItem.ToString() });
            }
            return Json(data);
        }
    }
}
