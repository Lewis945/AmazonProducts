import * as React from 'react';
import { Link } from 'react-router';
import { provide } from 'redux-typed';
import { ApplicationState }  from '../store';
import * as AmazonProductsState from '../store/AmazonProducts';
import { SelectControl } from './SelectControl';
import { ProductsList } from './ProductsList';

interface RouteParams {
    keywords: string;
    currency: string;
    page: string;
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
}

//---------------

class AmazonProducts extends React.Component<AmazonProductsProps, any> {

    context: IRouterContext & ISomeOtherContext;

    _keywordsInput: HTMLInputElement;

    static contextTypes = {
        router: React.PropTypes.func.isRequired
    }

    componentWillMount() {
        // This method runs when the component is first added to the page
        let { location } = this.props as any;
        let { query } = location;
        let keywords = query.keywords || 'csharp';
        let currency = query.currency || 'USD';
        let page = parseInt(query.page) || 1;
        this.props.setPage(page);
        this.props.requestProducts(keywords, currency, page);
        this.props.requestCurrencies();
    }

    componentWillReceiveProps(nextProps: AmazonProductsProps) {
        // This method runs when incoming props (e.g., route params) change
        let { location } = nextProps as any;
        let { query } = location;
        let keywords = query.keywords || 'csharp';
        let currency = query.currency || 'USD';
        let page = nextProps.forward;
        this.props.requestProducts(keywords, currency, page);
        this.props.requestCurrencies();
    }

    public render() {
        return <div>
            <h1>Amazon products list</h1>
            <span>Keywords: </span> <span>{this.props.response.keywords} </span> <br/>
            <span>Search: </span><input type="input" ref={(c) => this._keywordsInput = c}/> <a href="#" onClick={ (e) => { this.submitKeywords(); e.preventDefault(); } }>Search</a>
            <SelectControl onChange={(v) => this.submitCurrency(v) } options={this.props.currencies}/>
            <ProductsList page={this.props.page} forward={this.props.isLoading} onPageChanged={this.props.goForward} products={this.props.response.responseArray} />
            { this.renderPagination() }
        </div>;
    }

    private submitKeywords() {
        let { router } = this.context as any;
        let router1 = router as IRouter;

        let { location } = this.props as any;
        let { query } = location;

        var q = Object.assign({}, query, { keywords: this._keywordsInput.value });

        router1.push({ pathname: '/amazon', query: q });
    }

    private submitCurrency(value) {
        let { router } = this.context as any;
        let router1 = router as IRouter;

        let { location } = this.props as any;
        let { query } = location;

        var q = Object.assign({}, query, { currency: value });

        router1.push({ pathname: '/amazon', query: q });
    }

    private renderPagination() {
        let prevStartDateIndex = this.props.page - 5;
        let nextStartDateIndex = this.props.page + 5;

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