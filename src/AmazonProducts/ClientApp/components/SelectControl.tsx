import * as React from 'react';

interface ISelectControlProps {
    url: string;
    onChange: (value: string) => void;
    defaultOptions: Array<{ value: string, name: string }>;
}

interface ISelectControlState {
    options: Array<{ value: string, name: string }>;
}

export class SelectControl extends React.Component<ISelectControlProps, ISelectControlState> {

    constructor(props: ISelectControlProps) {
        super(props);
        this.state = { options: new Array<{ value: string, name: string }>() };
    }

    componentDidMount() {
        var data = this.props.defaultOptions;
        // get your data
        //$.ajax({
        //    url: this.props.url,
        //    success: this.successHandler
        //})
        this.successHandler(data);
    }

    successHandler(data) {
        // assuming data is an array of {name: "foo", value: "bar"}
        for (var i = 0; i < data.length; i++) {
            var option = data[i];
            this.state.options.push(
                option
            );
        }
        this.forceUpdate();
    }

    change(event) {
        this.props.onChange(event.target.value);
    }

    public render() {
        return <div>
            <select onChange={(e) => this.change(e) }>
                { this.state.options.map((option) => <option value={option.value}>{option.name}</option>) }
            </select>
        </div>;
    }
}
