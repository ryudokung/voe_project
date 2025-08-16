import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');
  
  const { user, canViewExecutive } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getOverview(period);
      
      if (response.success) {
        setDashboardData(response.data);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH').format(num || 0);
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'ส่งแล้ว',
      under_review: 'กำลังพิจารณา',
      shortlisted: 'คัดเลือกแล้ว',
      in_pilot: 'ทดลองใช้',
      implemented: 'ดำเนินการแล้ว',
      closed: 'ปิด'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: '#f59e0b',
      under_review: '#3b82f6',
      shortlisted: '#10b981',
      in_pilot: '#8b5cf6',
      implemented: '#059669',
      closed: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 btn btn-sm btn-primary"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            สวัสดี, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">ภาพรวมระบบ VOE ของคุณ</p>
        </div>
        
        {/* Period Selector */}
        <div className="mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="form-input form-select"
          >
            <option value="7d">7 วันที่ผ่านมา</option>
            <option value="30d">30 วันที่ผ่านมา</option>
            <option value="90d">90 วันที่ผ่านมา</option>
            <option value="1y">1 ปีที่ผ่านมา</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ไอเดียทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(dashboardData?.overview?.total_ideas)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">โหวตทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(dashboardData?.overview?.total_votes)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👍</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้ใช้ที่มีส่วนร่วม</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(dashboardData?.overview?.active_users)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">เวลาเฉลี่ยต่อการดำเนินการ</p>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardData?.overview?.avg_idea_to_action_days || 0}
                <span className="text-lg text-gray-600 ml-1">วัน</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ideas by Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ไอเดียตามสถานะ</h3>
          </div>
          
          <div className="space-y-3">
            {dashboardData?.ideas_by_status?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  ></div>
                  <span className="text-sm font-medium">{getStatusLabel(item.status)}</span>
                </div>
                <span className="text-lg font-semibold">{formatNumber(item.count)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ideas by Category */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ไอเดียตามหมวดหมู่</h3>
          </div>
          
          <div className="space-y-3">
            {dashboardData?.ideas_by_category?.slice(0, 6).map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <span className="text-lg font-semibold">{formatNumber(item.count)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Voted Ideas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ไอเดียยอดนิยม</h3>
          </div>
          
          <div className="space-y-4">
            {dashboardData?.top_voted_ideas?.slice(0, 5).map((idea) => (
              <div key={idea.id} className="border-l-4 border-blue-500 pl-4">
                <Link
                  to={`/ideas/${idea.id}`}
                  className="block hover:bg-gray-50 p-2 rounded"
                >
                  <h4 className="font-medium text-gray-900 hover:text-blue-600">
                    {idea.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👍 {idea.vote_count}</span>
                      <span>👤 {idea.creator?.name}</span>
                    </div>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(idea.status)}20`,
                        color: getStatusColor(idea.status)
                      }}
                    >
                      {getStatusLabel(idea.status)}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Link to="/ideas" className="btn btn-outline w-full">
              ดูไอเดียทั้งหมด
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">กิจกรรมล่าสุด</h3>
          </div>
          
          <div className="space-y-4">
            {dashboardData?.recent_activity?.slice(0, 6).map((activity) => (
              <div key={`${activity.id}-${activity.changed_at}`} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.changedBy?.name}</span>
                    {' '}เปลี่ยนสถานะไอเดีย{' '}
                    <Link
                      to={`/ideas/${activity.idea?.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      "{activity.idea?.title}"
                    </Link>
                    {' '}เป็น{' '}
                    <span className="font-medium">{getStatusLabel(activity.to_status)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.changed_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">การดำเนินการด่วน</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/ideas/create" className="btn btn-primary flex items-center justify-center">
              <span className="mr-2">➕</span>
              สร้างไอเดียใหม่
            </Link>
            
            <Link to="/ideas" className="btn btn-outline flex items-center justify-center">
              <span className="mr-2">💡</span>
              ดูไอเดียทั้งหมด
            </Link>
            
            {canViewExecutive() && (
              <Link to="/reports" className="btn btn-outline flex items-center justify-center">
                <span className="mr-2">📈</span>
                รายงานและสถิติ
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
