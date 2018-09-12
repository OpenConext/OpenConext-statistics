import React from "react";
import I18n from "i18n-js";
import "./DB.css";
import moment from "moment";
import "moment/locale/nl";
import {databaseStats} from "../api";
import "react-table/react-table.css";
import ReactTable from "react-table";

// moment.locale(I18n.locale);

const columns = [{
    id: "name",
    Header: I18n.t("db.name"),
    accessor: "name"
}, {
    Header: I18n.t("db.records"),
    accessor: "results",
    Cell: results => {
        const val = results.value[0];
        return val.count_count_user_id || val.count_distinct_count_user_id || val.count_user_id
    },
    sortMethod: (a, b) => {
        const n1 = a[0].count_count_user_id || a[0].count_distinct_count_user_id || a[0].count_user_id;
        const n2 = b[0].count_count_user_id || b[0].count_distinct_count_user_id || b[0].count_user_id;
        return n1 - n2;
    },
    maxWidth: 200,
    filterable: false
}];


export default class DB extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            series: [],
            config: {},
            loaded: false,
            time: undefined,
            error: false
        };
    }

    componentDidMount() {
        const now = moment();
        databaseStats()
            .then(data => this.setState({
                series: data.filter(s => s.name),
                config: data.filter(s => s.config)[0].config,
                loaded: true,
                time: Math.ceil((moment() - now) / 1000)
            })).catch(err => this.setState({error: true, loaded: true}));
    }

    render() {
        const {series, config, loaded, time, error} = this.state;
        const loadedOk = loaded && !error;
        return (
            <div className="db">
                {!loaded && <section className="loading">
                    <em>{I18n.t("db.loading")}</em>
                    <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                </section>}
                {!loadedOk && <section>
                    <h1 className="error">{I18n.t("db.timeout")}</h1>
                </section>}
                {loadedOk &&
                <section className="content">
                    <span className="title">{I18n.t("db.title", {
                        db: config.database,
                        measurement: config.measurement,
                        time: time
                    })}</span>
                    <ReactTable className="-striped" data={series}
                                showPagination={false} minRows={0} defaultPageSize={series.length}
                                filterable={true}
                                columns={columns} defaultSorted={[{id: "name", desc: false}]}/>
                </section>}
            </div>
        );
    }

}

DB.propTypes = {};