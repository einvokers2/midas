export interface Project {
    projectId: string | number; // 主键
    name: string;    // 项目名称
    description: string;    // 项目描述
    status: '未开始' | '进行中' | '已结束' | '暂停' | '失败';    // 项目状态
    priority: 'P0' | 'P1' | 'P2';    // 项目优先级
    startDate: Date;    // 项目开始时间
    endDate: Date;      // 项目结束时间
    createdAt: Date;    // 创建时间
}
