using System.Collections.Generic;

namespace AmazonProducts.Models
{
    /// <summary>
    /// Represents response retrieved from Amazon.
    /// </summary>
    public class AmazonResponse
    {
        /// <summary>
        /// Keywords to search.
        /// </summary>
        public string keywords { get; set; }

        /// <summary>
        /// List of amazon products.
        /// </summary>
        public List<AmazonProduct> responseArray { get; set; }

        /// <summary>
        /// Description of a request status.
        /// </summary>
        public string statusDescription { get; set; }
        /// <summary>
        /// Code of a request status.
        /// </summary>
        public string statusCode { get; set; }

        /// <summary>
        /// Indicates error.
        /// </summary>
        public bool isError { get; set; }
        /// <summary>
        /// Indicates cached result.
        /// </summary>
        public bool isFromCache { get; set; }
    }
}
