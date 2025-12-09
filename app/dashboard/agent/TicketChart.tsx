"use client";

import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

interface TicketChartProps {
    data: {
        id: string;
        value: number;
        color: string;
    }[];
}

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 20,
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}

export default function TicketChart({ data }: TicketChartProps) {
    const totalTickets = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
                Ticket Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
                <PieChart
                    series={[
                        {
                            innerRadius: 80,
                            outerRadius: 120,
                            data: data,
                            arcLabel: (item) => `${item.id} (${item.value})`,
                            arcLabelMinAngle: 45,
                            highlightScope: { fade: 'global', highlight: 'item' },
                            highlighted: { additionalRadius: 5 },
                            cornerRadius: 5,
                        },
                    ]}
                    sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                        },
                    }}
                    width={400}
                    height={300}
                >
                    <PieCenterLabel>Total: {totalTickets}</PieCenterLabel>
                </PieChart>
            </Box>
        </Box>
    );
}
