import "react-table/react-table.css";
import ReactTable from "react-table";
import React from "react";
import moment from "moment/moment";
import I18n from "i18n-js";
import "./ProviderTable.css";

export default function ProviderTable({data, modus, user}) {
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

    return <ReactTable className="-striped" data={data}
                       showPagination={false} minRows={0} defaultPageSize={data.length}
                       columns={columns} defaultSorted={[{id: "name", desc: false}]}/>
}
