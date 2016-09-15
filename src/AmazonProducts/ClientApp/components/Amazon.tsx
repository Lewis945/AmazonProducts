import * as React from 'react';
import { Link } from 'react-router';
import { provide } from 'redux-typed';
import { ApplicationState }  from '../store';
import * as AmazonProductsState from '../store/AmazonProducts';
import { SelectControl } from './SelectControl';
import { ModalControl } from './Modal';
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

    private _keywordsInput: HTMLInputElement;
    private _selectControl: SelectControl;
    private _modalControl: ModalControl;

    static contextTypes = {
        router: React.PropTypes.func.isRequired
    }

    componentWillMount() {
        // This method runs when the component is first added to the page
        let { location } = this.props as any;
        let { query } = location;
        let keywords = query.keywords || '';
        let currency = query.currency || 'USD';
        let page = parseInt(query.page) || 1;
        this.props.setPage(page);
        if (keywords != '')
            this.props.requestProducts(keywords, currency, page);
        this.props.requestCurrencies();

        if (keywords == '' && query.currency == null && query.page == null && this.props.response.responseArray.length > 0) {
            this.props.clearProductsList();
        }
    }

    componentDidMount() {
        let { location } = this.props as any;
        let { query } = location;
        let keywords = query.keywords || '';
        let currency = query.currency || 'USD';

        if (this._keywordsInput.value !== keywords) {
            this._keywordsInput.value = keywords;
        }
        if (this._selectControl.getValue() !== currency) {
            this._selectControl.setValue(currency);
        }
        this.setLoaderOffset();
    }

    componentDidUpdate() {
        this.setLoaderOffset();
        if (this.props.requestProducts.length > 0 && this.props.pagingFinished) {
            this._modalControl.open();
        }
    }

    private setLoaderOffset() {
        if (this.props.isLoading) {
            var loader = document.getElementById("amazon-loader");
            loader.style.top = (window.innerHeight / 2 + window.scrollY - 150) + "px";
        }
    }

    componentWillReceiveProps(nextProps: AmazonProductsProps) {
        // This method runs when incoming props (e.g., route params) change
        let { location } = nextProps as any;
        let { query } = location;
        let keywords = query.keywords || '';
        let currency = query.currency || 'USD';
        let page = nextProps.forward;

        if (keywords !== '' && query.currency == null && query.page == null) {
            this.props.clearProductsList();
        }

        if (keywords !== '') {
            this.props.requestProducts(keywords, currency, page);
        }

        this.props.requestCurrencies();
    }

    public render() {

        const onPageChanged = () => {
            if (!this.props.pagingFinished) {
                this.props.goForward();
            }
        };

        return <div>
            { this.props.isLoading ? <div className="loader-layout"></div> : '' }
            { this.props.isLoading ? <div id="amazon-loader" className="loader">Loading...</div> : '' }
            <h1>Amazon products list</h1>
            <span>Search: </span><input type="input" ref={(c) => this._keywordsInput = c}/> <a href="#" onClick={ (e) => { this.submitKeywords(); e.preventDefault(); } }>Search</a>
            <SelectControl onChange={(v) => this.submitCurrency(v) } options={this.props.currencies} ref={(c) => this._selectControl = c}/>
            <ProductsList
                page={this.props.page}
                forward={this.props.isLoading}
                onPageChanged={onPageChanged}
                products={this.props.response.responseArray}
                isLoading={this.props.isLoading}/>
            <ModalControl
                ref={(c) => this._modalControl = c}
                modalId={"amazon-modal"}
                title={"Error"}
                body={"<p>Amazon allows to get only 5 pages for All items search with keywords.<p/>"}
                closeBtnId={"amz-close"} />
        </div>;
    }

    private submitKeywords() {
        let { router } = this.context as any;
        let router1 = router as IRouter;

        let { location } = this.props as any;
        let { query } = location;

        var q = Object.assign({}, query, { page: 1, keywords: this._keywordsInput.value });

        this.props.setPage(1);
        router1.push({ pathname: '/amazon', query: q });
    }

    private submitCurrency(value) {
        let { router } = this.context as any;
        let router1 = router as IRouter;

        let { location } = this.props as any;
        let { query } = location;

        var q = Object.assign({}, query, { page: 1, currency: value });

        this.props.setPage(1);
        router1.push({ pathname: '/amazon', query: q });
    }
}

// Build the WeatherForecastProps type, which allows the component to be strongly typed
const provider = provide(
    (state: ApplicationState) => state.products, // Select which part of global state maps to this component
    AmazonProductsState.actionCreators                 // Select which action creators should be exposed to this component
).withExternalProps<{ params: RouteParams }>();          // Also include a 'params' property on WeatherForecastProps
type AmazonProductsProps = typeof provider.allProps;
export default provider.connect(AmazonProducts);