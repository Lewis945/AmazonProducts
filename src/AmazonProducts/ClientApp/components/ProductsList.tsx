import * as React from 'react';

export interface IProductsListState {
    loadingFlag: boolean;   //to avoid multiple fetch request if user is keep scrolling
}

export interface IProductsListProps extends React.Props<ProductsList> {
    products: Array<any>;
    onPageChanged: () => void;
    page: number;
    forward: boolean;
}

var loading = function (action) {
    // add the overlay with loading image to the page
    //if (action == "on") {
    //    var over = '<div id="overlay">' +
    //        '<img id="loading" src="http://bit.ly/pMtW1K" >' +
    //        '</div>';
    //    //$(over).appendTo('body');
    //    $('body').append(over);
    //    $('html, body').css("cursor", "wait");
    //    console.log("creating overlay");
    //}
    //else if (action == "off") {
    //    $("#overlay").remove();
    //    $('html, body').css("cursor", "auto");
    //    console.log("removing overlay");

    //}
};

export class ProductsList extends React.Component<IProductsListProps, IProductsListState> {

    constructor(props) {
        super(props);
        this.state = {
            loadingFlag: true
        };
    }

    componentWillMount() {
        //this.props.onUpdate();
        //console.log('update');
    }

    componentDidMount() {
        //setting initiall values
        //attach the scroll event listener to our scroll handler function
        window.addEventListener("scroll", (e) => { this.handleScroll(); });

        //to load comments initially
        loading("on");
    }

    handleScroll() {
        var em = document.getElementById("products");
        var height = em.clientHeight;
        var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

        var offSetBottom = height / (2.5 * this.props.page);
        var offSetTop = height - offSetBottom;

        //console.log('----- top ' + top + '------');
        //console.log('offSetBottom: ' + offSetBottom + '; offSetTop: ' + offSetTop);
        //console.log('height: ' + height + '; page: ' + this.props.page);
        //console.log('loading: ' + this.props.forward)
        //console.log('----------------');

        console.log('top ' + top + '--' + height + '--' + offSetBottom + '--' + offSetTop + '---' + (top > offSetTop) + '/' + !this.props.forward);
        if (top > offSetTop && !this.props.forward) { //this.state.loadingFlag) {
            console.log('----- top ' + top + '------');
            console.log('offSetBottom: ' + offSetBottom + '; offSetTop: ' + offSetTop);
            console.log('height: ' + height + '; page: ' + this.props.page);
            console.log('loading: ' + this.props.forward)
            console.log('----------------');
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
