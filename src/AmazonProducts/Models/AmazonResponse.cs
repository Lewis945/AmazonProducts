using System.Collections.Generic;

namespace AmazonProducts.Models
{
    public class AmazonResponse
    {
        public string keywords { get; set; }

        public List<AmazonProduct> responseArray { get; set; }

        public string statusDescription { get; set; }
        public string statusCode { get; set; }

        public bool isError { get; set; }
        public bool isFromCache { get; set; }
    }
}
