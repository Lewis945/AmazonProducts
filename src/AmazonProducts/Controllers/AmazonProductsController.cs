using AmazonProducts.Configuration;
using AmazonProducts.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace AmazonProducts.Controllers
{
    public class AmazonProductsController : Controller
    {
        private AppSettings _setting;

        public AmazonProductsController(IOptions<AppSettings> settings)
        {
            _setting = settings.Value;
        }

        public async Task<IActionResult> Index()
        {
            string associateTag = _setting.AssociateTag;
            string awsAccessKeyId = _setting.AccessKeyId;
            string awsSecretKey = _setting.SecretAccessKey;

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
                        responseJson = await apiHelper.ExecuteWebRequest(requestUri, keywords);
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
    }
}
