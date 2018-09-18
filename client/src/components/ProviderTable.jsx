import "react-table/react-table.css";
import ReactTable from "react-table";
import React from "react";
import moment from "moment/moment";
import I18n from "i18n-js";
import "./ProviderTable.css";
import PropTypes from "prop-types";


export default class ProviderTable extends React.Component {
    render() {
        const {data, modus, user} = this.props;
        const columns = [{
            id: "name",
            Header: I18n.t("providerTable.name"),
            accessor: "name",
            Cell: props => {
                const manage_id = props.original.manage_id;
                return manage_id ? <a target="_blank"
                                      href={`${user.manage_url}/metadata/saml20_sp/${manage_id}`}>{props.value}</a> :
                    <span className="invalid">{props.value}</span>
            },
        }, {
            Header: I18n.t("providerTable.state"),
            accessor: "state",
            maxWidth: 200
        }, {
            id: "date", // Required because this accessor is not a string
            Header: I18n.t(`providerTable.${modus}`),
            accessor: p => p.time ? moment(p.time).format() : I18n.t("providerTable.noTime"),
            maxWidth: 200
        }];
        return <ReactTable className="-striped"
                           data={data}
                           showPagination={false}
                           minRows={0}
                           defaultPageSize={data.length * 2}
                           filterable
                           defaultSorted={[{id: "name", desc: false}]}
                           columns={columns}/>
    }
}

ProviderTable.propTypes = {
    modus: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired
};
