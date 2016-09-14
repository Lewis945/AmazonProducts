import * as React from 'react';

interface IModalProps {
    modalId: string;
    buttonId?: string;
    title: string;
    body: string;
    footer?: string;
    closeBtnId: string;
}

export class ModalControl extends React.Component<IModalProps, void> {

    private _modal: any;
    private _btn: any;

    constructor(props: IModalProps) {
        super(props);
    }

    private _init() {
        // Get the modal
        this._modal = document.getElementById(this.props.modalId);

        var _this = this;

        if (this.props.buttonId != null) {
            // Get the button that opens the modal
            this._btn = document.getElementById(this.props.buttonId);

            // When the user clicks the button, open the modal
            this._btn.onclick = function (e) {
                _this.open();
            }
        }

        // Get the <span> element that closes the modal
        var span = document.getElementById(this.props.closeBtnId);
        var spanEl = span as HTMLElement;
        // When the user clicks on <span> (x), close the modal
        spanEl.onclick = function (e) {
            _this.close();
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == this._modal) {
                _this.close();
            }
        }
    }

    componentDidMount() {
        this._init();
    }

    componentDidUpdate() {
        this._init();
    }

    public open() {
        this._modal.style.display = "block";
    }

    public close() {
        this._modal.style.display = "none";
    }

    public render() {
        let body = this.props.body;
        function getBody() { return { __html: body }; };
        function getCross() { return { __html: "&#10006" }; };
        return <div id={this.props.modalId} className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <span className="close" id={this.props.closeBtnId} dangerouslySetInnerHTML={getCross()}></span>
                    <h2>{this.props.title}</h2>
                </div>
                <div className="modal-body" dangerouslySetInnerHTML={getBody() }>
                </div>
                <div className="modal-footer">
                    {this.props.footer !== null ? this.props.footer : ''}
                </div>
            </div>
        </div>;
    }
}
