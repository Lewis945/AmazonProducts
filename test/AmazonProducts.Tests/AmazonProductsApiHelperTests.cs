using AmazonProducts.Models;
using AmazonProducts.Utilities;
using NUnit.Framework;
using System;
using System.Net;
using System.Threading.Tasks;

namespace AmazonProducts.Tests
{
    [TestFixture]
    public class AmazonProductsApiHelperTests
    {
        [Test]
        public async Task Test_Receive_Amazon_Products_With_CSharp_Keyword()
        {
            string associateTag = "***";
            string awsAccessKeyId = "***";
            string awsSecretKey = "***";

            string keywords = "csharp";
            int page = 1;

            AmazonResponse response;

            if (string.IsNullOrEmpty(keywords))
            {
                response = AmazonApiHelper.GetEmptyResponse(string.Empty, string.Empty, HttpStatusCode.OK);
            }
            else
            {
                using (var apiHelper = new AmazonApiHelper(associateTag, awsAccessKeyId, awsSecretKey))
                {
                    string requestUri = apiHelper.GetRequestUri(keywords, page);
                    try
                    {
                        response = await apiHelper.ExecuteWebRequestAsync(requestUri, keywords);
                    }
                    catch (Exception ex)
                    {
                        response = AmazonApiHelper.GetEmptyResponse(keywords, ex.Message, HttpStatusCode.InternalServerError);
                    }
                }
            }

            Assert.That(response.responseArray.Count, Is.EqualTo(10));
            Assert.That(response.responseArray[0].asin, Is.EqualTo("1518877559"));
        }
    }
}
