import * as React from 'react';

export default class Home extends React.Component<any, void> {
    public render() {
        return <div>
            <h1 style={{ "text-align": "center" }}>Welcome to an Amazon Product API test application!</h1>
            <p style={{ "text-align": "center" }}>Welcome to a single-page application.</p>
            <h2 style={{ "text-align": "center" }}>Tasks</h2>
            <ul style={{ "margin": "auto", "width": "40%" }}>
                <li>Make a website, that enables searching for products among Amazon products.</li>
                <li>Using Amazon Product Advertising API (or REST) services, get list of products from Amazon using search</li>
                <li>Show results by 13 on one page, next page "preloaded"</li>
                <li>Using currency calculator enable user choose currency and show results on that</li>
                <li>Price/currency change realize with AJAX update, not full page load</li>
                <li>Make the page look nice</li>
                <li>Remove the keys and build files from the project you upload.</li>
            </ul>
            <h2 style={{ "text-align": "center" }}>Screenshots</h2>
            <ul style={{ "list-style-type": "none" }}>
                <li><img src="/dist/img/29-AiTBk2f0.jpg" alt="Screenshot 1" /></li>
                <li><img src="/dist/img/8RYyuXMJvbI.jpg" alt="Screenshot 2"/></li>
            </ul>
        </div>;
    }
}
