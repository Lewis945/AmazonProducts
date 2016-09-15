import * as React from 'react';
import { Router, Route, HistoryBase } from 'react-router';
import { Layout } from './components/Layout';
import Home from './components/Home';
import Amazon from './components/Amazon';

export default <Route component={ Layout }>
    <Route path='/' components={{ body: Home }} />
    <Route path='/amazon' components={{ body: Amazon }}/>
</Route>;
