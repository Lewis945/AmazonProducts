import * as React from 'react';
import { Link } from 'react-router';
import { provide } from 'redux-typed';
import { ApplicationState }  from '../store';
import * as AmazonProductsState from '../store/AmazonProducts';

interface RouteParams {
    startDateIndex: string;
}

class AmazonProducts extends React.Component<AmazonProductsProps, void> {
    componentWillMount() {
        // This method runs when the component is first added to the page 
        let startDateIndex = parseInt(this.props.params.startDateIndex) || 0;
        this.props.requestProducts(startDateIndex);
    }

    componentWillReceiveProps(nextProps: AmazonProductsProps) {
        // This method runs when incoming props (e.g., route params) change
        let startDateIndex = parseInt(nextProps.params.startDateIndex) || 0;
        this.props.requestProducts(startDateIndex);
    }

    public render() {
        return <div>
            <h1>Amazon products list</h1>
            <span>Keywords: </span> <span>{this.props.response.keywords} </span>
            { this.renderProductsTable() }
            { this.renderPagination() }
        </div>;
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
                        <td>{ product.productUrl }</td>
                        <td>{ product.price }</td>
                        <td>{ product.offersUrl }</td>
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