import * as React from 'react';
import { Link } from 'react-router';
import { provide } from 'redux-typed';
import { ApplicationState }  from '../store';
import * as AmazonProductsState from '../store/AmazonProducts';

interface RouteParams {
    keywords: string;
    startDateIndex: string;
}

//---------------

interface IRouter {
    replaceWith(path: string);
    transitionTo(path: string, query: Object);
    push(data: Object);
    push(path: string);
}

interface IRouterContext {
    router: IRouter;
}

interface ISomeOtherContext {
    somethingElse: any;
}

//---------------

class AmazonProducts extends React.Component<AmazonProductsProps, void> {

    context: IRouterContext & ISomeOtherContext;

    _keywordsInput: HTMLInputElement;

    static contextTypes = {
        router: React.PropTypes.func.isRequired
    }

    componentWillMount() {
        // This method runs when the component is first added to the page
        console.log(1);
        console.log(this.props);
        let { location } = this.props as any;
        let { query } = location;
        let keywords = query.keywords || 'csharp';
        let startDateIndex = parseInt(this.props.params.startDateIndex) || 0;
        this.props.requestProducts(keywords, startDateIndex);
    }

    componentWillReceiveProps(nextProps: AmazonProductsProps) {
        // This method runs when incoming props (e.g., route params) change
        console.log(2);
        console.log(nextProps);
        let { location } = nextProps as any;
        let { query } = location;
        let keywords = query.keywords || 'csharp';
        let startDateIndex = parseInt(nextProps.params.startDateIndex) || 0;
        this.props.requestProducts(keywords, startDateIndex);
    }

    public render() {
        return <div>
            <h1>Amazon products list</h1>
            <span>Keywords: </span> <span>{this.props.response.keywords} </span> <br/>
            <span>Search: </span><input type="input" ref={(c) => this._keywordsInput = c}/> <a href="#" onClick={ (e) => { this.submitKeywords(); e.preventDefault(); } }>Save</a>
            { this.renderProductsTable() }
            { this.renderPagination() }
        </div>;
    }

    private submitKeywords() {
        let { router } = this.context as any;
        let router1 = router as IRouter;
        console.log(this._keywordsInput.value);
        router1.push({ pathname: '/amazon', query: { keywords: this._keywordsInput.value } });

        //var http = new XMLHttpRequest();
        //var url = "/api/amazonproducts/products";
        //var params = "keywords=wcf&name=binny";
        //http.open("POST", url, true);

        ////Send the proper header information along with the request
        //http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        //http.onreadystatechange = function () {//Call a function when the state changes.
        //    if (http.readyState == 4 && http.status == 200) {
        //        alert(http.responseText);
        //    }
        //}
        //http.send(params);
    }

    private renderProductsTable() {
        return <table className='table'>
            <thead>
                <tr>
                    <th>asin</th>
                    <th>title</th>
                    <th>productImgUrl</th>
                    <th>productUrl</th>
                    <th>price</th>
                    <th>offersUrl</th>
                </tr>
            </thead>
            <tbody>
                {this.props.response.responseArray.map(product =>
                    <tr key={ product.asin }>
                        <td>{ product.asin }</td>
                        <td>{ product.title }</td>
                        <td><img src={ product.productImgUrl } alt={ product.title }/></td>
                        <td><a href= { product.productUrl }>{ product.title }</a></td>
                        <td>{ product.price }</td>
                        <td><a href={ product.offersUrl }>{ product.title }</a></td>
                    </tr>
                ) }
            </tbody>
        </table>;
    }

    private renderPagination() {
        let prevStartDateIndex = this.props.startDateIndex - 5;
        let nextStartDateIndex = this.props.startDateIndex + 5;

        return <p className='clearfix text-center'>
            <Link className='btn btn-default pull-left' to={ `/fetchdata/${prevStartDateIndex}` }>Previous</Link>
            <Link className='btn btn-default pull-right' to={ `/fetchdata/${nextStartDateIndex}` }>Next</Link>
            { this.props.isLoading ? <span>Loading...</span> : []}
        </p>;
    }
}

// Build the WeatherForecastProps type, which allows the component to be strongly typed
const provider = provide(
    (state: ApplicationState) => state.products, // Select which part of global state maps to this component
    AmazonProductsState.actionCreators                 // Select which action creators should be exposed to this component
).withExternalProps<{ params: RouteParams }>();          // Also include a 'params' property on WeatherForecastProps
type AmazonProductsProps = typeof provider.allProps;
export default provider.connect(AmazonProducts);