using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AmazonProductAdvertisingAPI;
using System.Net;
using Newtonsoft.Json;

namespace AmazonProducts.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Amazon()
        {
            string associateTag = "***";
            string awsAccessKeyId = "***";
            string awsSecretKey = "***";

            var keywords = "wcf";
            string responseJson = string.Empty;

            if (string.IsNullOrEmpty(keywords))
            {
                responseJson = AmazonApiHelper.GetEmptyResponseJson(string.Empty, string.Empty, HttpStatusCode.OK);
            }
            else
            {
                using (AmazonApiHelper apiHelper = new AmazonApiHelper(associateTag, awsAccessKeyId, awsSecretKey))
                {
                    string requestUri = apiHelper.GetRequestUri(keywords);
                    try
                    {
                        responseJson = apiHelper.ExecuteWebRequest(requestUri, keywords);
                    }
                    catch (Exception ex)
                    {
                        responseJson = AmazonApiHelper.GetEmptyResponseJson(keywords, ex.Message, HttpStatusCode.InternalServerError);
                    }
                }
            }

            dynamic stuff = JsonConvert.DeserializeObject(responseJson);

            var products = new List<dynamic>();
            foreach (var item in stuff.responseArray)
            {
                products.Add(item);
            }

            ViewBag.Keywords = stuff.keywords;
            ViewBag.Products = products;

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}