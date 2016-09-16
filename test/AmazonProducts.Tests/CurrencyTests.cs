using AmazonProducts.Utilities;
using NUnit.Framework;
using System.Threading.Tasks;

namespace AmazonProducts.Tests
{
    [TestFixture]
    public class CurrencyTests
    {
        [Test]
        public async Task Test_USD_To_UAH_Currency_Conversion()
        {
            var currencyHelper = new CurrencyHelper();

            decimal usdAmount = (decimal)15.35;
            decimal uahAmount = await currencyHelper.CurrencyConversionAsync(usdAmount, Currency.USD, Currency.UAH);

            Assert.That(uahAmount, Is.EqualTo(400.328000M));
        }
    }
}
