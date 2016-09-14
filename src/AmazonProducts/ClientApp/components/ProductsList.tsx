import * as React from 'react';

export interface IProductsListState {
}

export interface IProductsListProps extends React.Props<ProductsList> {
    products: Array<any>;
    onPageChanged: () => void;
    page: number;
    forward: boolean;
    isLoading: boolean;
}

export class ProductsList extends React.Component<IProductsListProps, IProductsListState> {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
    }

    componentDidMount() {
        //setting initiall values
        //attach the scroll event listener to our scroll handler function
        window.addEventListener("scroll", (e) => { this.handleScroll(e); });
    }

    componentDidUpdate() {
        if (this.props.isLoading) {
            this.unloadScrollBars();
        } else {
            this.reloadScrollBars();
        }
    }

    private reloadScrollBars() {
        document.documentElement.style.overflow = 'auto';  // firefox, chrome
        (document.body as any).scroll = "yes"; // ie only
    }

    private unloadScrollBars() {
        document.documentElement.style.overflow = 'hidden';  // firefox, chrome
        (document.body as any).scroll = "no"; // ie only
    }

    handleScroll(e) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            console.log('bottom reached! window.innerHeight: ' + window.innerHeight + '/ window.scrollY: ' + window.scrollY + ' / document.body.offsetHeight: ' + document.body.offsetHeight);
            this.props.onPageChanged();
        }
    }

    render() {
        return <table className='table' id='products'>
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
                {this.props.products.map(product =>
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
}
