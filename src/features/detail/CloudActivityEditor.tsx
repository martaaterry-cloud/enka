import React from 'react';
import type { Activity } from '../../models/activity';
export const CloudActivityEditor: React.FC<{activity: Activity}> = ({activity}) => <p>{activity.title}</p>;
