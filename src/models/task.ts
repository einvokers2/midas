export interface Task {
    taskId: string | number;    // 主键
    name: string;    // 任务名称
    description: string;    // 任务描述
    projectId: string | number;    // 所属项目
    status: '未开始' | '进行中' | '已结束' | '暂停' | '失败';    // 任务状态
    priority: 'P0' | 'P1' | 'P2';    // 任务优先级
    createdAt: Date;    // 创建时间
    endAt: Date;    // 结束时间
}