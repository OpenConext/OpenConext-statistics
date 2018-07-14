import "react-table/react-table.css";
import ReactTable from "react-table";
import React from "react";
import moment from "moment/moment";
import I18n from "i18n-js";
import "./ProviderTable.css";

export default function ProviderTable({data, modus}) {
    const columns = [{
        id: "name",
        Header: I18n.t("providerTable.name"),
        accessor: "name"
    }, {
        Header: I18n.t("providerTable.state"),
        accessor: "state",
        maxWidth: 200
    }, {
        Header: I18n.t("providerTable.logins"),
        accessor: "count_user_id",
        Cell: props => <span className="number">{modus === "newcomers" ? props.value : 0}</span>,
        maxWidth: 165
    }, {
        id: "date", // Required because this accessor is not a string
        Header: I18n.t(`providerTable.${modus}`),
        accessor: p => moment(p.time).format(),
        maxWidth: 200
    }];

    return <ReactTable className="-striped" data={data}
                       showPagination={false} minRows={0} defaultPageSize={data.length}
                       columns={columns} defaultSorted={[{id: "name", desc: false}]}/>
}
